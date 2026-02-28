import { GameState } from '../../state/GameState';

/** Flag is a number <= value. Missing flag is treated as 0. */
export type FlagLteCondition = { type: 'flag_lte'; key: string; value: number };

export const evalFlagLte = ({ flags }: GameState, { key, value }: FlagLteCondition): boolean =>
    ((flags[key]?.value as number) ?? 0) <= value;
