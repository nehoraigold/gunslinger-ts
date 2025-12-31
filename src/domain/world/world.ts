import { Room } from '../room';
import { Inventory } from '../inventory';
import { Item } from '../item';
import { Npc } from '../npc';
import { Exit } from '../exit';

export type World = {
    flags: Record<string, boolean>;
    rooms: Record<string, Room>;
    exits: Record<string, Exit>;
    inventories: Record<string, Inventory>;
    npcs: Record<string, Npc>;
    items: Record<string, Item>;
};
