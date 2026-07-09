import { Evaluator } from '../Evaluator';
import { ConditionOutcome } from '../ConditionOutcome';

export type TrueCondition = { type: 'true' };

export const evalTrue: Evaluator<TrueCondition> = () => ConditionOutcome.satisfied();
