import { FlagValue } from '../../state/flags';
import { Evaluator } from '../Evaluator';

export type FlagEqCondition = { type: 'flag_eq'; key: string; value: FlagValue };

export const evalFlagEq: Evaluator<FlagEqCondition> = (ctx, { key, value }) => {
    const actual = ctx.flags().get(key);
    return actual === undefined ? !value : actual === value;
};
