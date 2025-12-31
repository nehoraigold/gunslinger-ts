import { Inventory } from '../inventory';
import { Npc } from './npc';

export type NPCTableEntry = {
    id: string;
    name: string;
    description: string;
    aliases: string;
    inventory_id: string;
};

export const npcTableEntryToState = (entry: NPCTableEntry): Npc => {
    return {
        id: entry.id,
        name: entry.name,
        aliases: entry.aliases?.split(';'),
        description: entry.description,
        inventoryId: entry.inventory_id,
    };
};
