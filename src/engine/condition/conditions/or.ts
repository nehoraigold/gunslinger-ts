import { Condition } from '../Condition';
import { Evaluator } from '../Evaluator';
import { ConditionOutcome } from '../ConditionOutcome';

export type OrCondition = { type: 'or'; conditions: Condition[] };

export const makeEvalOr =
    (evaluate: Evaluator): Evaluator<OrCondition> =>
    (ctx, condition) =>
        condition.conditions.some((sub) => evaluate(ctx, sub).satisfied)
            ? ConditionOutcome.satisfied()
            : ConditionOutcome.unmetBy(condition);
