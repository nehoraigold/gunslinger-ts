import { Player } from './player';

export type PlayerTableEntry = {
    name: string;
    description: string;
    inventory_id: string;
    current_room_id: string;
};

export const playerTableEntryToState = (entry: PlayerTableEntry): Player => {
    return {
        name: entry.name,
        description: entry.description,
        inventoryId: entry.inventory_id,
        currentRoomId: entry.current_room_id,
    };
};
