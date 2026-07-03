import { ValueStore } from './ValueStore';
import { DeepReadonly } from '../../../utils/types';

export class DerivedValueStore<T> implements ValueStore<T> {
    constructor(
        private readonly getter: () => Readonly<T>,
        private readonly setter: (value: T) => void,
    ) {}

    get(): DeepReadonly<T> {
        return structuredClone(this.getter()) as DeepReadonly<T>;
    }

    update(updateFn: (draft: T) => void): void {
        const draft = this.get() as T;
        updateFn(draft);
        this.setter(structuredClone(draft));
    }
}
