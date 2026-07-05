import { Lock } from './Lock';
import { ItemId } from '../../state';
import { LockStore } from '../../store';

export class DefaultLock implements Lock {
    constructor(private readonly store: LockStore) {}

    get keyItemId(): ItemId {
        return this.store.get().keyItemId;
    }

    isLocked(): boolean {
        return this.store.get().isLocked;
    }

    consumesKey(): boolean {
        return this.store.get().consumesKey;
    }

    open(): void {
        this.store.update((state) => {
            state.isLocked = false;
        });
    }
}
