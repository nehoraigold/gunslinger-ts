import { Evaluator } from '../Evaluator';
import { ConditionOutcome } from '../ConditionOutcome';

export type FalseCondition = { type: 'false' };

export const evalFalse: Evaluator<FalseCondition> = (_ctx, condition) => ConditionOutcome.unmetBy(condition);
