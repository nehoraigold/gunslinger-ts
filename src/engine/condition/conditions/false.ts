import { Evaluator } from '../Evaluator';

export type FalseCondition = { type: 'false' };

export const evalFalse: Evaluator<FalseCondition> = () => false;
