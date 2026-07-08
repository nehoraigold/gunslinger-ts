import { Evaluator } from '../Evaluator';
import { flagAsNumber } from './flagAsNumber';

export type FlagLteCondition = { type: 'flag_lte'; key: string; value: number };

export const evalFlagLte: Evaluator<FlagLteCondition> = (ctx, { key, value }) => flagAsNumber(ctx, key) <= value;
