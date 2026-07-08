import { Evaluator } from '../Evaluator';
import { satisfied } from '../ConditionOutcome';

export type TrueCondition = { type: 'true' };

export const evalTrue: Evaluator<TrueCondition> = () => satisfied;
