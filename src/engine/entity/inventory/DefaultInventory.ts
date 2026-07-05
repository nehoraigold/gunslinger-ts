import { Inventory, InventoryEntry } from './Inventory';
import { ItemId } from '../../state';
import { InventoryStore } from '../../store';

export class DefaultInventory implements Inventory {
    constructor(private readonly store: InventoryStore) {}

    quantityOf(itemId: ItemId): number {
        return this.store.get()[itemId] ?? 0;
    }

    has(itemId: ItemId, quantity = 1): boolean {
        return this.quantityOf(itemId) >= quantity;
    }

    add(itemId: ItemId, quantity = 1): void {
        this.store.update((draft) => {
            draft[itemId] = (draft[itemId] ?? 0) + quantity;
        });
    }

    remove(itemId: ItemId, quantity = 1): void {
        this.store.update((draft) => {
            const remaining = (draft[itemId] ?? 0) - quantity;
            if (remaining > 0) {
                draft[itemId] = remaining;
            } else {
                delete draft[itemId];
            }
        });
    }

    list(): InventoryEntry[] {
        return Object.entries(this.store.get()).map(([itemId, quantity]) => ({ itemId, quantity }));
    }
}
