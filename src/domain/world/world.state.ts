import { RoomState } from '../room';
import { InventoryState } from '../inventory';

export type WorldState = {
    rooms: Record<string, RoomState>;
    inventories: Record<string, InventoryState>;
    //   npcs: Record<string, NPCState>;
    //   items: Record<string, ItemState>;
};
