// region imports
import { Direction } from './direction';
import { ActionType } from './action.type';
// endregion

interface IAction {
    type: ActionType;
}

export interface MoveAction extends IAction {
    type: ActionType.MOVE;
    data: {
        direction: Direction;
    };
}

export interface InteractAction extends IAction {
    type: ActionType.INTERACT;
    data: {
        with: string;
        interaction: string;
        interactionData: any;
    };
}

export interface TransferAction extends IAction {
    type: ActionType.TRANSFER;
    data: {
        itemId: string;
        from: string;
        to: string;
        quantity?: number;
    };
}

export interface LookAction extends IAction {
    type: ActionType.LOOK;
}

export interface InventoryAction extends IAction {
    type: ActionType.INVENTORY;
}

export interface QuitAction extends IAction {
    type: ActionType.QUIT;
}

export interface HelpAction extends IAction {
    type: ActionType.HELP;
}

export interface UnknownAction extends IAction {
    type: ActionType.UNKNOWN;
    data: {
        reason: 'ambiguous' | 'unsupported' | 'unparsable';
        candidates?: Exclude<Action, UnknownAction>[];
    };
}

export type Action =
    | MoveAction
    | LookAction
    | InventoryAction
    | TransferAction
    | QuitAction
    | HelpAction
    | InteractAction
    | UnknownAction;

export type ActionOf<T extends ActionType> = Extract<Action, { type: T }>;
