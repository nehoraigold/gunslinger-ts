import { FlagValue } from '../../flag';
import { GameState } from '../../state/GameState';

export type FlagEqCondition = {
    type: 'flag_eq';
    key: string;
    /** Flag equals this exact value. Missing flag is treated as falsy (false / 0 / ''). */
    value: FlagValue;
};

export const evalFlagEq = ({ flags }: GameState, { key, value }: FlagEqCondition): boolean => {
    const actual = flags[key]?.value;
    return actual === undefined ? !value : actual === value;
};
