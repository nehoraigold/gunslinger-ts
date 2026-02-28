import { GameState } from '../state/GameState';
import { AndCondition, Condition, NotCondition, OrCondition } from './Condition';
import { evalFlagEq } from './conditions/flagEq';
import { evalFlagGte } from './conditions/flagGte';
import { evalFlagLte } from './conditions/flagLte';
import { evalHasItem } from './conditions/hasItem';
import { evalLacksItem } from './conditions/lacksItem';
import { evalNpcAlive } from './conditions/npcAlive';
import { evalNpcMood } from './conditions/npcMood';
import { evalRoomVisited } from './conditions/roomVisited';

// ── Logical combinators ───────────────────────────────────────────────────────
// These stay here because their eval functions reference evaluateCondition recursively.

const evalAnd = (state: GameState, { conditions }: AndCondition): boolean =>
    conditions.every((c) => evaluateCondition(state, c));

const evalOr = (state: GameState, { conditions }: OrCondition): boolean =>
    conditions.some((c) => evaluateCondition(state, c));

const evalNot = (state: GameState, { condition }: NotCondition): boolean => !evaluateCondition(state, condition);

// ── Dispatch ──────────────────────────────────────────────────────────────────

type EvalFn<C extends Condition> = (state: GameState, condition: C) => boolean;

type EvaluatorMap = { [K in Condition['type']]: EvalFn<Extract<Condition, { type: K }>> };

const evaluators: EvaluatorMap = {
    true: () => true,
    false: () => false,
    flag_eq: evalFlagEq,
    flag_gte: evalFlagGte,
    flag_lte: evalFlagLte,
    has_item: evalHasItem,
    lacks_item: evalLacksItem,
    npc_alive: evalNpcAlive,
    npc_mood: evalNpcMood,
    room_visited: evalRoomVisited,
    and: evalAnd,
    or: evalOr,
    not: evalNot,
};

export const evaluateCondition = (state: GameState, condition: Condition): boolean =>
    (evaluators[condition.type] as EvalFn<Condition>)(state, condition);
