import { RoomState } from '../room';
import { InventoryState } from '../inventory';
import { ItemState } from '../item';
import { NPCState } from '../npc';
import { ExitState } from '../exit';

export type WorldState = {
    flags: Record<string, boolean>;
    rooms: Record<string, RoomState>;
    exits: Record<string, ExitState>;
    inventories: Record<string, InventoryState>;
    npcs: Record<string, NPCState>;
    items: Record<string, ItemState>;
};
