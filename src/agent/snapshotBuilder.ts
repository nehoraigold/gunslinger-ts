import { GameState } from '../engine/state/GameState';
import { WorldSnapshot } from '../engine/world/WorldSnapshot';
import { healthValueToProse } from '../engine/state/utils';
import { isAlive } from '../engine/npc';
import { getVisibleRoomItems, getRoomNpcs } from '../engine/actions/common/utils';

// ── Available actions ─────────────────────────────────────────────────────────

const COMBAT_ACTIONS = ['attack', 'flee', 'checkStatus', 'useItem', 'getFlag', 'setFlag'];

const EXPLORATION_ACTIONS = [
    'move',
    'lookRoom',
    'lookItem',
    'lookNpc',
    'lookExit',
    'checkInventory',
    'checkStatus',
    'pickUp',
    'drop',
    'equip',
    'unequip',
    'useItem',
    'startCombat',
    'talkTo',
    'openTradeMenu',
    'getFlag',
    'setFlag',
];

export function getAvailableActions(state: GameState): string[] {
    return state.combat !== null ? COMBAT_ACTIONS : EXPLORATION_ACTIONS;
}

// ── Snapshot builder ──────────────────────────────────────────────────────────

export function buildWorldSnapshot(state: GameState): WorldSnapshot {
    const { player, world, combat, flags, turnCount } = state;
    const room = world.rooms[player.currentRoomId];

    // Room exits
    const exits = room.exits.map((exit) => {
        const dest = world.rooms[exit.destinationRoomId];
        return {
            direction: exit.direction,
            destinationName: exit.destinationKnown && dest ? dest.name : 'Unknown',
            isBlocked: exit.isBlocked,
        };
    });

    // NPCs present — include dead NPCs (isAlive: false shape)
    const npcsPresent = getRoomNpcs(state, room).map((summary) => {
        if (!summary.isAlive) {
            return {
                id: summary.id,
                name: summary.name,
                isAlive: false as const,
                mood: 'dead',
                healthProse: 'fatal' as const,
            };
        }
        return {
            id: summary.id,
            name: summary.name,
            isAlive: true as const,
            mood: summary.mood,
            healthProse: summary.health,
        };
    });

    // Items visible in room
    const itemsPresent = getVisibleRoomItems(state, room).map(({ id, name, shortDesc, quantity }) => ({
        id,
        name,
        shortDesc,
        quantity,
    }));

    // Player inventory — flag equipped items
    const playerInventory = Object.entries(player.inventory).map(([id, quantity]) => {
        const item = world.items[id];
        const isWeapon = player.equippedWeapon === id;
        const isArmor = player.equippedArmor === id;
        const isEquipped = isWeapon || isArmor;
        return {
            id,
            name: item?.name ?? id,
            isEquipped,
            slot: isWeapon ? ('weapon' as const) : isArmor ? ('armor' as const) : undefined,
            quantity,
        };
    });

    const equippedWeapon = player.equippedWeapon
        ? { id: player.equippedWeapon, name: world.items[player.equippedWeapon]?.name ?? player.equippedWeapon }
        : null;

    const equippedArmor = player.equippedArmor
        ? { id: player.equippedArmor, name: world.items[player.equippedArmor]?.name ?? player.equippedArmor }
        : null;

    const playerHealthProse = healthValueToProse({ health: player.health, maxHealth: player.maxHealth });

    // Active combat
    const combatSummary = (() => {
        if (!combat) return null;
        const enemy = world.npcs[combat.enemyId];
        if (!enemy) return null;
        return {
            enemyId: combat.enemyId,
            enemyName: enemy.name,
            enemyHealthProse: healthValueToProse({ health: enemy.health, maxHealth: enemy.maxHealth }),
            round: combat.round,
            canFlee: combat.canFlee,
        };
    })();

    // Active effects
    const activeEffects = player.activeEffects.map(({ name, description, turnsRemaining }) => ({
        name,
        description,
        turnsRemaining,
    }));

    // Active quests only
    const activeQuests = Object.values(world.quests)
        .filter((q) => q.stage === 'active')
        .map((q) => {
            const currentObj = q.objectives[q.currentObjectiveIndex];
            return {
                id: q.id,
                name: q.name,
                currentObjective: currentObj?.description ?? '(no objective)',
                stage: q.stage,
                isComplete: false,
            };
        });

    return {
        room: { id: room.id, name: room.name, exits },
        npcsPresent,
        itemsPresent,
        playerInventory,
        equippedWeapon,
        equippedArmor,
        playerHealthProse,
        gold: player.gold,
        combat: combatSummary,
        activeEffects,
        activeQuests,
        availableActions: getAvailableActions(state),
        turnCount,
    };
}

// ── Snapshot → string (appended to LLM user message) ─────────────────────────

export function snapshotToString(snap: WorldSnapshot): string {
    const lines: string[] = [];

    lines.push('=== WORLD STATE ===');
    lines.push(`Turn: ${snap.turnCount}`);
    lines.push('');

    // Combat banner — placed first so it's impossible to miss
    if (snap.combat) {
        const c = snap.combat;
        lines.push(
            `⚔ COMBAT — ${c.enemyName} (${c.enemyId}) | round ${c.round} | enemy: ${c.enemyHealthProse}${c.canFlee ? ' | can flee' : ' | no retreat'}`,
        );
        lines.push('');
    }

    // Location
    lines.push(`LOCATION: ${snap.room.name} (${snap.room.id})`);

    // Exits
    const exitLines = snap.room.exits.map((e) => {
        const dest = e.destinationName !== 'Unknown' ? e.destinationName : '???';
        const blocked = e.isBlocked ? ' [BLOCKED]' : '';
        return `  ${e.direction} → ${dest}${blocked}`;
    });
    if (exitLines.length > 0) {
        lines.push('EXITS:');
        lines.push(...exitLines);
    }

    // NPCs
    if (snap.npcsPresent.length > 0) {
        lines.push('NPCS HERE:');
        for (const npc of snap.npcsPresent) {
            if (!npc.isAlive) {
                lines.push(`  ${npc.name} (${npc.id}) — dead`);
            } else {
                lines.push(`  ${npc.name} (${npc.id}) — ${npc.mood}, ${npc.healthProse}`);
            }
        }
    }

    // Items in room
    if (snap.itemsPresent.length > 0) {
        lines.push('ITEMS HERE:');
        for (const item of snap.itemsPresent) {
            lines.push(`  ${item.name} (${item.id}) ×${item.quantity}`);
        }
    }

    lines.push('');

    // Player status
    lines.push('PLAYER:');
    lines.push(`  Health: ${snap.playerHealthProse} | Gold: ${snap.gold}`);
    if (snap.equippedWeapon) {
        lines.push(`  Weapon: ${snap.equippedWeapon.name} (${snap.equippedWeapon.id})`);
    }
    if (snap.equippedArmor) {
        lines.push(`  Armor: ${snap.equippedArmor.name} (${snap.equippedArmor.id})`);
    }
    if (snap.activeEffects.length > 0) {
        const fx = snap.activeEffects.map((e) => `${e.name} (${e.turnsRemaining} turns)`).join(', ');
        lines.push(`  Effects: ${fx}`);
    }

    // Inventory
    if (snap.playerInventory.length > 0) {
        lines.push('INVENTORY:');
        for (const item of snap.playerInventory) {
            const tag = item.isEquipped ? ` [${item.slot}]` : '';
            lines.push(`  ${item.name} (${item.id}) ×${item.quantity}${tag}`);
        }
    }

    // Quests
    if (snap.activeQuests.length > 0) {
        lines.push('');
        lines.push('QUESTS:');
        for (const q of snap.activeQuests) {
            lines.push(`  ${q.name} (${q.id}) — ${q.currentObjective}`);
        }
    }

    lines.push('');
    lines.push(`AVAILABLE ACTIONS: ${snap.availableActions.join(', ')}`);

    return lines.join('\n');
}
