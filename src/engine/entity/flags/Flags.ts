import { FlagValue } from '../../state';

export interface Flags {
    get(key: string): FlagValue | undefined;
    has(key: string): boolean;
    set(key: string, value: FlagValue): FlagValue | undefined;
}
