import { GameState } from '../state/GameState';
import { isAlive } from '../npc/npcUtils';
import {
    AndCondition,
    Condition,
    FlagEqCondition,
    FlagGteCondition,
    FlagLteCondition,
    HasItemCondition,
    LacksItemCondition,
    NpcAliveCondition,
    NpcMoodCondition,
    NotCondition,
    OrCondition,
    RoomVisitedCondition,
} from './Condition';

export const evaluateCondition = (state: GameState, condition: Condition): boolean => {
    switch (condition.type) {
        case 'true':
            return true;
        case 'false':
            return false;
        case 'flag_eq':
            return evalFlagEq(state, condition);
        case 'flag_gte':
            return evalFlagGte(state, condition);
        case 'flag_lte':
            return evalFlagLte(state, condition);
        case 'has_item':
            return evalHasItem(state, condition);
        case 'lacks_item':
            return evalLacksItem(state, condition);
        case 'npc_alive':
            return evalNpcAlive(state, condition);
        case 'npc_mood':
            return evalNpcMood(state, condition);
        case 'room_visited':
            return evalRoomVisited(state, condition);
        case 'and':
            return evalAnd(state, condition);
        case 'or':
            return evalOr(state, condition);
        case 'not':
            return evalNot(state, condition);
    }
};

// ── Flag ──────────────────────────────────────────────────────────────────────

const evalFlagEq = ({ flags }: GameState, { key, value }: FlagEqCondition): boolean => {
    const actual = flags[key]?.value;
    // Missing flag is falsy — equivalent to false / 0 / ''
    return actual === undefined ? !value : actual === value;
};

const evalFlagGte = ({ flags }: GameState, { key, value }: FlagGteCondition): boolean =>
    ((flags[key]?.value as number) ?? 0) >= value;

const evalFlagLte = ({ flags }: GameState, { key, value }: FlagLteCondition): boolean =>
    ((flags[key]?.value as number) ?? 0) <= value;

// ── Items ─────────────────────────────────────────────────────────────────────

const countIn = (inv: Record<string, number>, itemId: string): number => inv[itemId] ?? 0;

const compareQty = (actual: number, comparison: HasItemCondition['comparison'], quantity: number): boolean => {
    switch (comparison) {
        case 'at_least':
            return actual >= quantity;
        case 'exactly':
            return actual === quantity;
        case 'at_most':
            return actual <= quantity;
    }
};

const evalHasItem = (
    state: GameState,
    { itemId, location, roomId, comparison, quantity }: HasItemCondition,
): boolean => {
    if (location === 'player') {
        return compareQty(countIn(state.player.inventory, itemId), comparison, quantity);
    }
    const room = state.world.rooms[roomId ?? state.player.currentRoomId];
    return room ? compareQty(countIn(room.items, itemId), comparison, quantity) : false;
};

const evalLacksItem = (state: GameState, { itemId, location, roomId }: LacksItemCondition): boolean => {
    if (location === 'player') {
        return countIn(state.player.inventory, itemId) === 0;
    }
    const room = state.world.rooms[roomId ?? state.player.currentRoomId];
    return room ? countIn(room.items, itemId) === 0 : true;
};

// ── NPCs ──────────────────────────────────────────────────────────────────────

const evalNpcAlive = ({ world }: GameState, { npcId }: NpcAliveCondition): boolean => {
    const npc = world.npcs[npcId];
    return npc ? isAlive(npc) : false;
};

const evalNpcMood = ({ world }: GameState, { npcId, mood }: NpcMoodCondition): boolean => {
    const npc = world.npcs[npcId];
    return npc ? npc.mood === mood : false;
};

// ── Rooms ─────────────────────────────────────────────────────────────────────

const evalRoomVisited = ({ world }: GameState, { roomId }: RoomVisitedCondition): boolean =>
    world.rooms[roomId]?.visited ?? false;

// ── Logical combinators ───────────────────────────────────────────────────────

const evalAnd = (state: GameState, { conditions }: AndCondition): boolean =>
    conditions.every((c) => evaluateCondition(state, c));

const evalOr = (state: GameState, { conditions }: OrCondition): boolean =>
    conditions.some((c) => evaluateCondition(state, c));

const evalNot = (state: GameState, { condition }: NotCondition): boolean => !evaluateCondition(state, condition);
