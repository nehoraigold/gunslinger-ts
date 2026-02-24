import { FlagValue } from './FlagValue';

export interface FlagEntry {
    key: string;
    value: FlagValue;
    setAtTurn: number;
    previousValue: FlagValue | null;
}
