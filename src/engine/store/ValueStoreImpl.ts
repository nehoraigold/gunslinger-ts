import { ValueStore } from './ValueStore';

export class ValueStoreImpl<T extends object> implements ValueStore<T> {
    constructor(private value: T) {}

    get(): Readonly<T> {
        return this.clone(this.value);
    }

    update(updateFn: (draft: T) => void): void {
        const clone = this.get();
        updateFn(clone);
        this.value = this.clone(clone);
    }

    private clone(value: T): T {
        return structuredClone(value);
    }
}
