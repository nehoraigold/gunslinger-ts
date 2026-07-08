import { FlagValue } from '../../state/flags';
import { Evaluator } from '../Evaluator';
import { compare } from '../comparison';
import { flagAsNumber } from './flagAsNumber';

export type FlagValueCondition =
    | { type: 'flag_value'; key: string; value: FlagValue; comparison?: 'exactly' }
    | { type: 'flag_value'; key: string; value: number; comparison: 'at_least' | 'at_most' };

export const evalFlagValue: Evaluator<FlagValueCondition> = (ctx, condition) => {
    if (condition.comparison === 'at_least' || condition.comparison === 'at_most') {
        return compare(flagAsNumber(ctx, condition.key), condition.comparison, condition.value);
    }
    const actual = ctx.flags().get(condition.key);
    return actual === undefined ? !condition.value : actual === condition.value;
};
