import { Inventory } from './inventory';
import { Room } from '../room';

export type InventoryTableEntry = {
    id: string;
    items: string;
};

const itemsStringToMap = (items: string): Record<string, number> => {
    return JSON.parse(items);
};

export const inventoryTableEntryToState = (entry: InventoryTableEntry): Inventory => {
    return {
        id: entry.id,
        items: entry.items ? itemsStringToMap(entry.items) : {},
    };
};

export const addEmptyRoomInventories = (inventories: Inventory[], rooms: Room[]): Inventory[] => {
    const isRoomInventoryExists = (inventories: Inventory[], room: Room) =>
        inventories.some((inv) => inv.id === room.inventoryId);

    const updatedInventories = inventories.concat();
    rooms.forEach((room) => {
        if (!isRoomInventoryExists(inventories, room)) {
            updatedInventories.push({
                id: room.inventoryId,
                items: {},
            });
        }
    });
    return updatedInventories;
};
