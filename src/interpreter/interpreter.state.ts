import { Item } from '../domain/item';
import { Npc } from '../domain/npc';
import { Direction } from '../engine';

export type InterpreterItemState = Omit<Item, 'description' | 'uses'> & {
    quantity: number;
};

export type InterpreterNPCState = Omit<Npc, 'description' | 'inventoryId'> & {
    inventory: InterpreterInventory;
};

export type InterpreterInventory = {
    id: string;
    items: InterpreterItemState[];
};

export type InterpreterState = {
    room: {
        id: string;
        name: string;
        description: string;
        inventory: InterpreterInventory;
    };

    visibleExits: Partial<Record<Direction, string>>;
    visibleNPCs: InterpreterNPCState[];

    player: {
        name: string;
        description: string;
        inventory: InterpreterInventory;
    };
};
