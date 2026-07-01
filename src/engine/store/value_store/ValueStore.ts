export interface ValueStore<T> {
    get(): Readonly<T>;
    update(updateFn: (draft: T) => void): void;
}
