import { ItemState } from '../domain/item';
import { NPCState } from '../domain/npc';
import { Direction } from 'node:tty';

export type InterpreterItemState = Omit<ItemState, 'id' | 'description'> & {
    quantity: number;
};

export type InterpreterNPCState = Omit<NPCState, 'id' | 'description' | 'inventoryId'> & {
    items: InterpreterItemState[];
};

export type InterpreterState = {
    location: {
        name: string;
        description: string;
        visibleExits: Partial<Record<Direction, string>>;
        visibleNPCs: InterpreterNPCState[];
        visibleItems: InterpreterItemState[];
    };

    inventory: InterpreterItemState[];
};
