import { Condition } from '../Condition';
import { Evaluator } from '../Evaluator';

export type OrCondition = { type: 'or'; conditions: Condition[] };

export const makeEvalOr =
    (evaluate: Evaluator): Evaluator<OrCondition> =>
    (ctx, { conditions }) =>
        conditions.some((condition) => evaluate(ctx, condition));
