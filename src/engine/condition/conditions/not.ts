import { Condition } from '../Condition';
import { Evaluator } from '../Evaluator';

export type NotCondition = { type: 'not'; condition: Condition };

export const makeEvalNot =
    (evaluate: Evaluator): Evaluator<NotCondition> =>
    (ctx, { condition }) =>
        !evaluate(ctx, condition);
