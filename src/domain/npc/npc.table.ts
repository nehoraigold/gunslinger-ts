import { InventoryState } from '../inventory';
import { NPCState } from './npc.state';

export type NPCTableEntry = {
    id: string;
    name: string;
    description: string;
    aliases: string;
    inventory_id: string;
};

export const npcTableEntryToState = (entry: NPCTableEntry): NPCState => {
    return {
        id: entry.id,
        name: entry.name,
        aliases: entry.aliases?.split(';'),
        description: entry.description,
        inventoryId: entry.inventory_id,
    };
};
