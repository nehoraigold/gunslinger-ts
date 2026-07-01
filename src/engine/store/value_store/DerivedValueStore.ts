import { ValueStore } from './ValueStore';

export class DerivedValueStore<T> implements ValueStore<T> {
    constructor(
        private readonly getter: () => Readonly<T>,
        private readonly setter: (value: T) => void,
    ) {}

    get(): Readonly<T> {
        return structuredClone(this.getter());
    }

    update(updateFn: (draft: T) => void): void {
        const draft = this.get() as T;
        updateFn(draft);
        this.setter(structuredClone(draft));
    }
}
