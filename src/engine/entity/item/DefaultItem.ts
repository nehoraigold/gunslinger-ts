import { Item } from './Item';
import { ItemId, ItemType } from '../../state';
import { ItemStore } from '../../store';
import { ItemEffect } from '../../effect';

export class DefaultItem implements Item {
    constructor(
        public readonly id: ItemId,
        private readonly store: ItemStore,
    ) {}

    get name(): string {
        return this.store.get().name;
    }

    get description(): string {
        return this.store.get().description;
    }

    get type(): ItemType {
        return this.store.get().type;
    }

    get stackable(): boolean {
        return this.store.get().stackable;
    }

    get value(): number {
        return this.store.get().value;
    }

    get weight(): number {
        return this.store.get().weight;
    }

    get takeable(): boolean {
        return this.store.get().takeable;
    }

    get droppable(): boolean {
        return this.store.get().droppable;
    }

    get useEffect(): ItemEffect | undefined {
        return this.store.get().useEffect;
    }

    get consumedOnUse(): boolean {
        return this.store.get().consumedOnUse;
    }
}
