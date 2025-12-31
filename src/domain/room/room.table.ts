import { Direction } from '../../engine/action';
import { Room } from './room';
import { Exit } from '../exit';

export type RoomTableEntry = {
    id: string;
    name: string;
    description: string;
    inventory_id?: string;
    npc_ids: string;
};

export const roomIdToInventoryId = (roomId: string): string => `${roomId}_inventory`;

export const roomTableEntryToState = (entry: RoomTableEntry, exits: Exit[]): Room => {
    const roomExits = exits.filter((exit) => exit.fromRoomId === entry.id);

    const inventoryId = entry.inventory_id ?? roomIdToInventoryId(entry.id);
    return {
        id: entry.id,
        name: entry.name,
        description: entry.description,
        npcIds: entry.npc_ids?.split(';') ?? [],
        inventoryId,
        visited: false,
        exits: Object.fromEntries(roomExits.map((exit) => [exit.direction, exit.id])),
    };
};
