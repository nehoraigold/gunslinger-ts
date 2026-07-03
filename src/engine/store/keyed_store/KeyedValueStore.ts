import { ValueStore } from '../value_store';
import { DeepReadonly } from '../../../utils/types';

export interface KeyedValueStore<Id extends string, T> {
    getAll(): DeepReadonly<Record<Id, T>>;
    get(id: Id): DeepReadonly<T> | undefined;
    store(id: Id): ValueStore<T> | undefined;
    add(id: Id, data: T): void;
    remove(id: Id): void;
}
