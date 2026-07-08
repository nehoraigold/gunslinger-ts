import { Condition } from '../Condition';
import { Evaluator } from '../Evaluator';
import { satisfied, unmetBy } from '../ConditionOutcome';

export type OrCondition = { type: 'or'; conditions: Condition[] };

export const makeEvalOr =
    (evaluate: Evaluator): Evaluator<OrCondition> =>
    (ctx, condition) =>
        condition.conditions.some((sub) => evaluate(ctx, sub).satisfied) ? satisfied : unmetBy(condition);
