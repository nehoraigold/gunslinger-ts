import { InventoryState } from './inventory.state';
import { RoomState } from '../room';

export type InventoryTableEntry = {
    id: string;
    items: string;
};

const itemsStringToMap = (items: string): Record<string, number> => {
    return JSON.parse(items);
};

export const inventoryTableEntryToState = (entry: InventoryTableEntry): InventoryState => {
    return {
        id: entry.id,
        items: entry.items ? itemsStringToMap(entry.items) : {},
    };
};

export const addEmptyRoomInventories = (inventories: InventoryState[], rooms: RoomState[]): InventoryState[] => {
    const isRoomInventoryExists = (inventories: InventoryState[], room: RoomState) =>
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
