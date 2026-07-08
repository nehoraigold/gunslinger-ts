import { Evaluator } from '../Evaluator';

export type TrueCondition = { type: 'true' };

export const evalTrue: Evaluator<TrueCondition> = () => true;
