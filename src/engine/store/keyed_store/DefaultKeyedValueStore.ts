import { ValueStore, DerivedValueStore } from '../value_store';
import { KeyedValueStore } from './KeyedValueStore';
import { DeepReadonly } from '../../../utils/types';

export class DefaultKeyedValueStore<Id extends string, T extends object> implements KeyedValueStore<Id, T> {
    private readonly state: Record<Id, T>;

    constructor(initialState?: Record<Id, T>) {
        this.state = initialState ?? ({} as Record<Id, T>);
    }

    getAll(): DeepReadonly<Record<Id, T>> {
        return structuredClone(this.state) as DeepReadonly<Record<Id, T>>;
    }

    get(id: Id): DeepReadonly<T> | undefined {
        const value = this.state[id];
        return value ? (structuredClone(value) as DeepReadonly<T>) : undefined;
    }

    store(id: Id): ValueStore<T> | undefined {
        if (!(id in this.state)) {
            return undefined;
        }

        return new DerivedValueStore(
            () => this.state[id],
            (value) => {
                this.state[id] = value;
            },
        );
    }

    add(id: Id, value: T): void {
        if (!(id in this.state)) {
            this.state[id] = structuredClone(value);
        }
    }

    remove(id: Id): void {
        delete this.state[id];
    }
}
