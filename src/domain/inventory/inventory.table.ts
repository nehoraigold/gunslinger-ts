import { InventoryState } from './inventory.state';

export type InventoryTableEntry = {
    id: string;
    items: string;
};

const itemsStringToMap = (items: string): Record<string, number> => {
    return Object.fromEntries(
        items.split(';').map((itemQtyPair) => {
            const [id, qty] = itemQtyPair.trim().split(':');
            return [id.trim(), parseInt(qty.trim(), 10)];
        }),
    );
};

export const inventoryTableEntryToState = (entry: InventoryTableEntry): InventoryState => {
    return {
        id: entry.id,
        items: entry.items ? itemsStringToMap(entry.items) : {},
    };
};
