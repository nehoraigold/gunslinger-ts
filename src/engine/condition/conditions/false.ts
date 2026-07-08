import { Evaluator } from '../Evaluator';
import { unmetBy } from '../ConditionOutcome';

export type FalseCondition = { type: 'false' };

export const evalFalse: Evaluator<FalseCondition> = (_ctx, condition) => unmetBy(condition);
