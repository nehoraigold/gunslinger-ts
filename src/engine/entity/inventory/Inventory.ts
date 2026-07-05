import { ItemId } from '../../state';

export type InventoryEntry = { itemId: ItemId; quantity: number };

export interface Inventory {
    quantityOf(itemId: ItemId): number;
    has(itemId: ItemId, quantity?: number): boolean;
    add(itemId: ItemId, quantity?: number): void;
    remove(itemId: ItemId, quantity?: number): void;
    list(): InventoryEntry[];
}
