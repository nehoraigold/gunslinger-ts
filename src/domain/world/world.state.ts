import { RoomState } from '../room';
import { InventoryState } from '../inventory';
import { ItemState } from '../item';
import { NPCState } from '../npc';

export type WorldState = {
    rooms: Record<string, RoomState>;
    inventories: Record<string, InventoryState>;
    npcs: Record<string, NPCState>;
    items: Record<string, ItemState>;
};
