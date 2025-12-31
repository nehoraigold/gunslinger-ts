import { Direction } from './direction';

export type StartAction = {
    type: 'start';
};

export type MoveAction = {
    type: 'move';
    data: {
        direction: Direction;
    };
};

export type InteractAction = {
    type: 'interact';
    data: {
        with: string;
        interaction: string;
        interactionData: any;
    };
};

export type TransferAction = {
    type: 'transfer';
    data: {
        itemId: string;
        fromInventoryId: string;
        toInventoryId: string;
        quantity: number;
    };
};

export type LookAction = {
    type: 'look';
};

export type InventoryAction = {
    type: 'inventory';
};

export type UseItemAction = {
    type: 'use_item';
    data: {
        itemId: string;
        target?: {
            type: 'player' | 'room' | 'exit' | 'npc' | 'item';
            id: string;
        };
        intent?: string;
    };
};

export type QuitAction = {
    type: 'quit';
};

export type HelpAction = {
    type: 'help';
};

export type UnknownAction = {
    type: 'unknown';
    data: {
        reason: 'ambiguous' | 'unsupported' | 'unparsable';
        message?: string;
    };
};

export type Action =
    | StartAction
    | MoveAction
    | LookAction
    | UseItemAction
    | InventoryAction
    | TransferAction
    | QuitAction
    | HelpAction
    | InteractAction
    | UnknownAction;
