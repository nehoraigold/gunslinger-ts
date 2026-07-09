import { Context } from '../context';
import { Condition } from './Condition';
import { Evaluator } from './Evaluator';
import { ConditionOutcome } from './ConditionOutcome';
import { evalTrue } from './conditions/true';
import { evalFalse } from './conditions/false';
import { evalFlagValue } from './conditions/flagValue';
import { evalHasItem } from './conditions/hasItem';
import { evalLacksItem } from './conditions/lacksItem';
import { evalRoomVisited } from './conditions/roomVisited';
import { evalNpcMood } from './conditions/npcMood';
import { evalNpcAlive } from './conditions/npcAlive';
import { makeEvalAnd } from './conditions/and';
import { makeEvalOr } from './conditions/or';
import { makeEvalNot } from './conditions/not';

type EvaluatorMap = { [K in Condition['type']]: Evaluator<Extract<Condition, { type: K }>> };

export function evaluateCondition<K extends Condition['type']>(
    ctx: Context,
    condition: Extract<Condition, { type: K }>,
): ConditionOutcome {
    return evaluators[condition.type](ctx, condition);
}

const evaluators: EvaluatorMap = {
    true: evalTrue,
    false: evalFalse,
    flag_value: evalFlagValue,
    has_item: evalHasItem,
    lacks_item: evalLacksItem,
    room_visited: evalRoomVisited,
    npc_mood: evalNpcMood,
    npc_alive: evalNpcAlive,
    and: makeEvalAnd(evaluateCondition),
    or: makeEvalOr(evaluateCondition),
    not: makeEvalNot(evaluateCondition),
};
