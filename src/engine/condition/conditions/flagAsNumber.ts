import { Context } from '../../context';

export const flagAsNumber = (ctx: Context, key: string): number => {
    const value = ctx.flags().get(key);
    return typeof value === 'number' ? value : 0;
};
