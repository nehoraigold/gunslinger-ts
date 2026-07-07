import { Flags } from './Flags';
import { FlagsStore } from '../../store';
import { FlagValue } from '../../state';

export class DefaultFlags implements Flags {
    constructor(private readonly store: FlagsStore) {}

    get(key: string): FlagValue | undefined {
        return this.store.get()[key];
    }

    has(key: string): boolean {
        return this.get(key) !== undefined;
    }

    set(key: string, value: FlagValue): FlagValue | undefined {
        const previous = this.get(key);
        this.store.update((flags) => {
            flags[key] = value;
        });
        return previous;
    }
}
