import { expect } from 'chai';
import { produce } from 'immer';
import { initGameState } from '../../src/initGameState.js';
import { buildWorldSnapshot, getAvailableActions, snapshotToString } from '../../src/agent/snapshotBuilder.js';
import { GameState } from '../../src/engine/state/GameState.js';

// ─── helpers ─────────────────────────────────────────────────────────────────

function withCombat(state: GameState): GameState {
    return produce(state, (draft) => {
        draft.combat = {
            enemyId: 'npc_corpse_01',
            round: 2,
            playerTurn: true,
            canFlee: true,
            playerModifiers: [],
            enemyModifiers: [],
            roundLog: [],
            startedAtTurn: 0,
        };
    });
}

function withPlayerInRoom(state: GameState, roomId: string): GameState {
    return produce(state, (draft) => {
        draft.player.currentRoomId = roomId;
    });
}

// ─── getAvailableActions ──────────────────────────────────────────────────────

describe('getAvailableActions', () => {
    it('returns exploration actions when not in combat', () => {
        const state = initGameState();
        const actions = getAvailableActions(state);
        expect(actions).to.include('move');
        expect(actions).to.include('lookRoom');
        expect(actions).to.include('startCombat');
        expect(actions).to.include('talkTo');
        expect(actions).not.to.include('attack');
        expect(actions).not.to.include('flee');
    });

    it('returns combat actions when in combat', () => {
        const state = withCombat(initGameState());
        const actions = getAvailableActions(state);
        expect(actions).to.include('attack');
        expect(actions).to.include('flee');
        expect(actions).not.to.include('move');
        expect(actions).not.to.include('startCombat');
        expect(actions).not.to.include('talkTo');
    });
});

// ─── buildWorldSnapshot ───────────────────────────────────────────────────────

describe('buildWorldSnapshot', () => {
    it('includes correct room id and name', () => {
        const state = initGameState();
        const snap = buildWorldSnapshot(state);
        expect(snap.room.id).to.equal('room_1_1');
        expect(snap.room.name).to.equal('The Guttered Candle');
    });

    it('includes exits with destination names', () => {
        const state = initGameState();
        const snap = buildWorldSnapshot(state);
        const exitDirections = snap.room.exits.map((e) => e.direction);
        // room_1_1 has north, east, west exits (south to mill was removed)
        expect(exitDirections).to.include('north');
        expect(exitDirections).to.include('east');
        expect(exitDirections).to.include('west');
        for (const exit of snap.room.exits) {
            expect(exit.destinationName).to.be.a('string').and.not.equal('');
        }
    });

    it('includes NPCs present with IDs', () => {
        const state = initGameState();
        const snap = buildWorldSnapshot(state);
        // Mira is in room_1_1
        const mira = snap.npcsPresent.find((n) => n.id === 'npc_mira_01');
        expect(mira).to.exist;
        expect(mira!.name).to.equal('Mira');
        expect(mira!.isAlive).to.be.true;
    });

    it('includes visible items with IDs', () => {
        const state = initGameState();
        const snap = buildWorldSnapshot(state);
        // Bottle and note are in room_1_1, both always-visible
        const ids = snap.itemsPresent.map((i) => i.id);
        expect(ids).to.include('item_bottle_01');
        expect(ids).to.include('item_note_01');
        for (const item of snap.itemsPresent) {
            expect(item.id).to.be.a('string').and.not.equal('');
            expect(item.quantity).to.be.greaterThan(0);
        }
    });

    it('does not include hidden items', () => {
        // The iron key in room_2_2 has revealCondition: false
        const state = withPlayerInRoom(initGameState(), 'room_2_2');
        const snap = buildWorldSnapshot(state);
        const ids = snap.itemsPresent.map((i) => i.id);
        expect(ids).not.to.include('item_iron_key_01');
    });

    it('reports player health as prose, never a number', () => {
        const state = initGameState();
        const snap = buildWorldSnapshot(state);
        // Full health (100/100) → 'healthy'
        expect(snap.playerHealthProse).to.equal('healthy');
        const validValues = ['healthy', 'bruised', 'wounded', 'battered', 'fatal'];
        expect(validValues).to.include(snap.playerHealthProse);
    });

    it('includes player gold', () => {
        const state = initGameState();
        const snap = buildWorldSnapshot(state);
        expect(snap.gold).to.equal(10);
    });

    it('combat is null when not in combat', () => {
        const state = initGameState();
        const snap = buildWorldSnapshot(state);
        expect(snap.combat).to.be.null;
    });

    it('combat block is populated when in combat', () => {
        const state = withCombat(withPlayerInRoom(initGameState(), 'room_2_2'));
        const snap = buildWorldSnapshot(state);
        expect(snap.combat).to.exist;
        expect(snap.combat!.enemyId).to.equal('npc_corpse_01');
        expect(snap.combat!.enemyName).to.equal('Restless Corpse');
        expect(snap.combat!.round).to.equal(2);
        expect(snap.combat!.canFlee).to.be.true;
        // Enemy health should be prose
        const validValues = ['healthy', 'bruised', 'wounded', 'battered', 'fatal'];
        expect(validValues).to.include(snap.combat!.enemyHealthProse);
    });

    it('availableActions differs between combat and exploration', () => {
        const exploration = buildWorldSnapshot(initGameState());
        const combat = buildWorldSnapshot(withCombat(initGameState()));
        expect(exploration.availableActions).to.include('move');
        expect(combat.availableActions).to.include('attack');
        expect(exploration.availableActions).not.to.include('attack');
        expect(combat.availableActions).not.to.include('move');
    });

    it('inventory reflects equipped items', () => {
        const state = produce(initGameState(), (draft) => {
            draft.player.inventory['item_knife_01'] = 1;
            draft.player.equippedWeapon = 'item_knife_01';
        });
        const snap = buildWorldSnapshot(state);
        const knife = snap.playerInventory.find((i) => i.id === 'item_knife_01');
        expect(knife).to.exist;
        expect(knife!.isEquipped).to.be.true;
        expect(knife!.slot).to.equal('weapon');
        expect(snap.equippedWeapon).to.deep.equal({ id: 'item_knife_01', name: 'Hunting Knife' });
    });

    it('no active quests by default', () => {
        const state = initGameState();
        const snap = buildWorldSnapshot(state);
        expect(snap.activeQuests).to.be.an('array').with.length(0);
    });

    it('includes turnCount', () => {
        const state = initGameState();
        const snap = buildWorldSnapshot(state);
        expect(snap.turnCount).to.equal(0);
    });

    it('dead NPC shape has isAlive false', () => {
        const state = produce(withPlayerInRoom(initGameState(), 'room_2_2'), (draft) => {
            draft.world.npcs['npc_corpse_01'].health = 0;
        });
        const snap = buildWorldSnapshot(state);
        const corpse = snap.npcsPresent.find((n) => n.id === 'npc_corpse_01');
        expect(corpse).to.exist;
        expect(corpse!.isAlive).to.be.false;
    });
});

// ─── snapshotToString ─────────────────────────────────────────────────────────

describe('snapshotToString', () => {
    it('contains room id and name', () => {
        const snap = buildWorldSnapshot(initGameState());
        const str = snapshotToString(snap);
        expect(str).to.include('room_1_1');
        expect(str).to.include('The Guttered Candle');
    });

    it('contains NPC ids', () => {
        const snap = buildWorldSnapshot(initGameState());
        const str = snapshotToString(snap);
        expect(str).to.include('npc_mira_01');
    });

    it('contains visible item ids', () => {
        const snap = buildWorldSnapshot(initGameState());
        const str = snapshotToString(snap);
        expect(str).to.include('item_bottle_01');
        expect(str).to.include('item_note_01');
    });

    it('does not contain raw health numbers', () => {
        const snap = buildWorldSnapshot(initGameState());
        const str = snapshotToString(snap);
        // Health prose present, no bare HP numbers like "100/100" or "HP:"
        expect(str).to.include('healthy');
        expect(str).not.to.match(/\b100\/100\b/);
        expect(str).not.to.match(/HP:/);
    });

    it('shows AVAILABLE ACTIONS line', () => {
        const snap = buildWorldSnapshot(initGameState());
        const str = snapshotToString(snap);
        expect(str).to.include('AVAILABLE ACTIONS:');
        expect(str).to.include('move');
    });

    it('shows combat banner when in combat', () => {
        const state = withCombat(withPlayerInRoom(initGameState(), 'room_2_2'));
        const snap = buildWorldSnapshot(state);
        const str = snapshotToString(snap);
        expect(str).to.include('COMBAT');
        expect(str).to.include('npc_corpse_01');
        expect(str).to.include('attack');
    });

    it('does not show combat banner when not in combat', () => {
        const snap = buildWorldSnapshot(initGameState());
        const str = snapshotToString(snap);
        expect(str).not.to.include('COMBAT');
    });
});
