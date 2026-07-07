import { Context } from '../../context';
import { FlagEqCondition, FlagGteCondition, FlagLteCondition } from '../Condition';

const asNumber = (value: unknown): number => (typeof value === 'number' ? value : 0);

/** Flag equals the value exactly. A missing flag is treated as falsy (false / 0 / ''). */
export const evalFlagEq = (ctx: Context, { key, value }: FlagEqCondition): boolean => {
    const actual = ctx.flags().get(key);
    return actual === undefined ? !value : actual === value;
};

/** Flag is a number >= value. A missing or non-numeric flag is treated as 0. */
export const evalFlagGte = (ctx: Context, { key, value }: FlagGteCondition): boolean =>
    asNumber(ctx.flags().get(key)) >= value;

/** Flag is a number <= value. A missing or non-numeric flag is treated as 0. */
export const evalFlagLte = (ctx: Context, { key, value }: FlagLteCondition): boolean =>
    asNumber(ctx.flags().get(key)) <= value;
