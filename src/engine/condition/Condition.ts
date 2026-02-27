import { FlagValue } from '../flag';
import { NpcMood } from '../npc/NpcMood';

// ── Sentinels ────────────────────────────────────────────────────────────────

export type TrueCondition = { type: 'true' };
export type FalseCondition = { type: 'false' };

// ── Flag conditions ───────────────────────────────────────────────────────────

/** Flag equals an exact value. Missing flag is treated as falsy (false / 0 / ''). */
export type FlagEqCondition = { type: 'flag_eq'; key: string; value: FlagValue };
/** Flag is a number >= value. Missing flag is treated as 0. */
export type FlagGteCondition = { type: 'flag_gte'; key: string; value: number };
/** Flag is a number <= value. Missing flag is treated as 0. */
export type FlagLteCondition = { type: 'flag_lte'; key: string; value: number };

// ── Item conditions ───────────────────────────────────────────────────────────

/**
 * Player's inventory or a specific room contains (at least / exactly / at most) N of an item.
 * When location is 'room' and roomId is omitted, the player's current room is used.
 */
export type HasItemCondition = {
    type: 'has_item';
    itemId: string;
    location: 'player' | 'room';
    roomId?: string;
    comparison: 'at_least' | 'exactly' | 'at_most';
    quantity: number;
};

/**
 * Inverse of has_item (quantity === 0).
 * When location is 'room' and roomId is omitted, the player's current room is used.
 */
export type LacksItemCondition = {
    type: 'lacks_item';
    itemId: string;
    location: 'player' | 'room';
    roomId?: string;
};

// ── NPC conditions ────────────────────────────────────────────────────────────

/** NPC exists and has health > 0. */
export type NpcAliveCondition = { type: 'npc_alive'; npcId: string };
/** NPC exists and has the given mood. */
export type NpcMoodCondition = { type: 'npc_mood'; npcId: string; mood: NpcMood };

// ── Room conditions ───────────────────────────────────────────────────────────

/** Room has been visited at least once. */
export type RoomVisitedCondition = { type: 'room_visited'; roomId: string };

// ── Logical combinators ───────────────────────────────────────────────────────

export type AndCondition = { type: 'and'; conditions: Condition[] };
export type OrCondition = { type: 'or'; conditions: Condition[] };
export type NotCondition = { type: 'not'; condition: Condition };

// ── Union ─────────────────────────────────────────────────────────────────────

export type Condition =
    | TrueCondition
    | FalseCondition
    | FlagEqCondition
    | FlagGteCondition
    | FlagLteCondition
    | HasItemCondition
    | LacksItemCondition
    | NpcAliveCondition
    | NpcMoodCondition
    | RoomVisitedCondition
    | AndCondition
    | OrCondition
    | NotCondition;
