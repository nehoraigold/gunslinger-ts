import { Condition } from '../Condition';
import { Evaluator } from '../Evaluator';
import { ConditionOutcome } from '../ConditionOutcome';

export type AndCondition = { type: 'and'; conditions: Condition[] };

export const makeEvalAnd =
    (evaluate: Evaluator): Evaluator<AndCondition> =>
    (ctx, { conditions }) => {
        const unmet = conditions.flatMap((condition) => {
            const outcome = evaluate(ctx, condition);
            return outcome.satisfied ? [] : outcome.unmet;
        });
        return unmet.length === 0 ? ConditionOutcome.satisfied() : ConditionOutcome.unmetBy(...unmet);
    };
