export interface EntityStore<Id extends string, T> {
    getAll(): Record<Id, T>;
    get(id: Id): T | undefined;
    update(id: Id, updateFn: (draft: T) => void): void;
    add(id: Id, data: T): void;
    remove(id: Id): void;
}
