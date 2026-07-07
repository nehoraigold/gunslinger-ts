import { Context } from '../context';
import { Condition, AndCondition, OrCondition, NotCondition } from './Condition';
import { evalFlagEq, evalFlagGte, evalFlagLte } from './conditions/flags';
import { evalHasItem, evalLacksItem } from './conditions/items';
import { evalRoomVisited, evalNpcMood, evalNpcAlive } from './conditions/world';

const evalAnd = (ctx: Context, { conditions }: AndCondition): boolean =>
    conditions.every((condition) => evaluateCondition(ctx, condition));

const evalOr = (ctx: Context, { conditions }: OrCondition): boolean =>
    conditions.some((condition) => evaluateCondition(ctx, condition));

const evalNot = (ctx: Context, { condition }: NotCondition): boolean => !evaluateCondition(ctx, condition);

type Evaluator<C extends Condition> = (ctx: Context, condition: C) => boolean;
type EvaluatorMap = { [K in Condition['type']]: Evaluator<Extract<Condition, { type: K }>> };

const evaluators: EvaluatorMap = {
    true: () => true,
    false: () => false,
    flag_eq: evalFlagEq,
    flag_gte: evalFlagGte,
    flag_lte: evalFlagLte,
    has_item: evalHasItem,
    lacks_item: evalLacksItem,
    room_visited: evalRoomVisited,
    npc_mood: evalNpcMood,
    npc_alive: evalNpcAlive,
    and: evalAnd,
    or: evalOr,
    not: evalNot,
};

export const evaluateCondition = (ctx: Context, condition: Condition): boolean =>
    (evaluators[condition.type] as Evaluator<Condition>)(ctx, condition);

/** Evaluates an optional condition; an absent condition is treated as satisfied (no gate). */
export const evalConditionOpt = (ctx: Context, condition: Condition | undefined): boolean =>
    condition === undefined || evaluateCondition(ctx, condition);
