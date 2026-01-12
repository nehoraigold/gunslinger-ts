import { Item } from '../domain/item';
import { Npc } from '../domain/npc';
import { Direction } from '../engine';

export type InterpreterInput = {
    game_state: InterpreterGameState;
    action_text: string;
};

export type InterpreterItemState = Omit<Item, 'description' | 'uses' | 'transferable'> & {
    quantity: number;
    use_verbs: string[];
};

export type InterpreterNPCState = Omit<Npc, 'description' | 'inventoryId' | 'topics'> & {
    inventory: InterpreterInventory;
    visibleTopics: string[];
};

export type InterpreterInventory = {
    id: string;
    items: InterpreterItemState[];
};

export type InterpreterExit = {
    id: string;
    type: string;
    direction: Direction;
    toRoomId: string;
};

export type InterpreterGameState = {
    room: {
        id: string;
        name: string;
        description: string;
        inventory: InterpreterInventory;
    };

    visibleExits: Partial<Record<Direction, InterpreterExit>>;
    visibleNPCs: InterpreterNPCState[];

    player: {
        name: string;
        description: string;
        inventory: InterpreterInventory;
    };
};
