import { FlagValue } from '../../state/flags';
import { Evaluator } from '../Evaluator';
import { ConditionOutcome } from '../ConditionOutcome';
import { compare } from '../comparison';
import { flagAsNumber } from './flagAsNumber';

export type FlagValueCondition =
    | { type: 'flag_value'; key: string; value: FlagValue; comparison?: 'exactly' }
    | { type: 'flag_value'; key: string; value: number; comparison: 'at_least' | 'at_most' };

export const evalFlagValue: Evaluator<FlagValueCondition> = (ctx, condition) => {
    const met =
        condition.comparison === 'at_least' || condition.comparison === 'at_most'
            ? compare(flagAsNumber(ctx, condition.key), condition.comparison, condition.value)
            : flagEquals(ctx.flags().get(condition.key), condition.value);
    return met ? ConditionOutcome.satisfied() : ConditionOutcome.unmetBy(condition);
};

const flagEquals = (actual: FlagValue | undefined, value: FlagValue): boolean =>
    actual === undefined ? !value : actual === value;
