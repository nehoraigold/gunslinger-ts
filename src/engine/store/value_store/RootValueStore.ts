import { DerivedValueStore } from './DerivedValueStore';

export class RootValueStore<T extends object> extends DerivedValueStore<T> {
    private value: T;

    constructor(value: T) {
        super(
            () => this.value,
            (value: T) => (this.value = value),
        );
        this.value = value;
    }
}
