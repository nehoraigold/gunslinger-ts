import { Condition } from '../Condition';
import { Evaluator } from '../Evaluator';
import { ConditionOutcome } from '../ConditionOutcome';

export type NotCondition = { type: 'not'; condition: Condition };

export const makeEvalNot =
    (evaluate: Evaluator): Evaluator<NotCondition> =>
    (ctx, condition) =>
        evaluate(ctx, condition.condition).satisfied
            ? ConditionOutcome.unmetBy(condition)
            : ConditionOutcome.satisfied();
