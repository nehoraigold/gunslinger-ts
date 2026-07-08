import { Condition } from '../Condition';
import { Evaluator } from '../Evaluator';

export type AndCondition = { type: 'and'; conditions: Condition[] };

export const makeEvalAnd =
    (evaluate: Evaluator): Evaluator<AndCondition> =>
    (ctx, { conditions }) =>
        conditions.every((condition) => evaluate(ctx, condition));
