import { Item } from './Item';
import { ItemId, ItemType } from '../../state';
import { ItemStore } from '../../store';

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
}
