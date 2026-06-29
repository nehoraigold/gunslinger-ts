import { EntityStore } from './EntityStore';
import { ValueStore } from './ValueStore';
import { ValueStoreImpl } from './ValueStoreImpl';

export class EntityStoreImpl<Id extends string, T> implements EntityStore<Id, T> {
    private readonly state: ValueStore<Record<Id, T>>;

    constructor(initialState?: Record<Id, T>) {
        this.state = new ValueStoreImpl(initialState ?? ({} as Record<Id, T>));
    }

    getAll(): Readonly<Record<Id, T>> {
        return this.state.get();
    }

    get(id: Id): Readonly<T | undefined> {
        return this.getAll()[id];
    }

    update(id: Id, updateFn: (draft: T) => void): void {
        this.state.update((record) => {
            const entity = record[id];
            if (entity) {
                updateFn(entity);
            }
        });
    }

    add(id: Id, data: T): void {
        this.state.update((record) => {
            if (!record[id]) {
                record[id] = data;
            }
        });
    }

    remove(id: Id): void {
        this.state.update((record) => {
            delete record[id];
        });
    }
}
