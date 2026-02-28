export type { FlagEqCondition } from './conditions/flagEq';
export type { FlagGteCondition } from './conditions/flagGte';
export type { FlagLteCondition } from './conditions/flagLte';
export type { HasItemCondition } from './conditions/hasItem';
export type { LacksItemCondition } from './conditions/lacksItem';
export type { NpcAliveCondition } from './conditions/npcAlive';
export type { NpcMoodCondition } from './conditions/npcMood';
export type { RoomVisitedCondition } from './conditions/roomVisited';

import type { FlagEqCondition } from './conditions/flagEq';
import type { FlagGteCondition } from './conditions/flagGte';
import type { FlagLteCondition } from './conditions/flagLte';
import type { HasItemCondition } from './conditions/hasItem';
import type { LacksItemCondition } from './conditions/lacksItem';
import type { NpcAliveCondition } from './conditions/npcAlive';
import type { NpcMoodCondition } from './conditions/npcMood';
import type { RoomVisitedCondition } from './conditions/roomVisited';

// ── Sentinels ────────────────────────────────────────────────────────────────

export type TrueCondition = { type: 'true' };
export type FalseCondition = { type: 'false' };

// ── Logical combinators ───────────────────────────────────────────────────────
// These stay here because they reference the Condition union recursively.

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
