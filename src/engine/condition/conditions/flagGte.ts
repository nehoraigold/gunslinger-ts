import { Evaluator } from '../Evaluator';
import { flagAsNumber } from './flagAsNumber';

export type FlagGteCondition = { type: 'flag_gte'; key: string; value: number };

export const evalFlagGte: Evaluator<FlagGteCondition> = (ctx, { key, value }) => flagAsNumber(ctx, key) >= value;
