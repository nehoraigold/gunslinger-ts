import { Direction } from '../../action';
import { RoomState } from './room.state';
import { ExitState } from './exit.state';

export type RoomTableEntry = {
    id: string;
    name: string;
    description: string;
    inventory_id?: string;
    npc_ids: string;
} & {
    [K in `${Direction}_exit`]?: string;
};

const exitColumnsToMap = (entry: RoomTableEntry): RoomState['exits'] => {
    // using keys() on Record<Direction, null> to ensure we evaluate for all possible directions
    const directions = Object.keys({ east: null, north: null, south: null, west: null } satisfies Record<
        Direction,
        null
    >) as Direction[];
    const exits: RoomState['exits'] = {};
    directions.forEach((direction) => {
        const toRoomId = entry[`${direction}_exit`];
        if (toRoomId) {
            exits[direction] = {
                toRoomId,
            };
        }
    });

    return exits;
};

export const roomIdToInventoryId = (roomId: string): string => `${roomId}_inventory`;

export const roomTableEntryToState = (entry: RoomTableEntry): RoomState => {
    const inventoryId = entry.inventory_id ?? roomIdToInventoryId(entry.id);
    return {
        id: entry.id,
        name: entry.name,
        description: entry.description,
        npcIds: entry.npc_ids?.split(';') ?? [],
        inventoryId,
        visited: false,
        exits: exitColumnsToMap(entry),
    };
};
