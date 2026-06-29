export interface ValueStore<T extends object> {
    get(): T;
    update(updateFn: (draft: T) => void): void;
}
