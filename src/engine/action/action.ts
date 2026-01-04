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
        inventoryType: 'player' | 'room';
        verb: string;
        targetId?: string;
    };
};

export type DialogueAction = {
    type: 'dialogue';
    data: {
        npcId: string;
        topicId: string | 'unknown';
        rawText?: string;
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
    | DialogueAction
    | InventoryAction
    | TransferAction
    | QuitAction
    | HelpAction
    | UnknownAction;
