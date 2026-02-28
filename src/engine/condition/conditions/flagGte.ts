import { GameState } from '../../state/GameState';

/** Flag is a number >= value. Missing flag is treated as 0. */
export type FlagGteCondition = { type: 'flag_gte'; key: string; value: number };

export const evalFlagGte = ({ flags }: GameState, { key, value }: FlagGteCondition): boolean =>
    ((flags[key]?.value as number) ?? 0) >= value;
