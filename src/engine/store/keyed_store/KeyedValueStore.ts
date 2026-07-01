import { ValueStore } from '../value_store';

export interface KeyedValueStore<Id extends string, T> {
    getAll(): Record<Id, T>;
    get(id: Id): Readonly<T> | undefined;
    store(id: Id): ValueStore<T> | undefined;
    add(id: Id, data: T): void;
    remove(id: Id): void;
}
