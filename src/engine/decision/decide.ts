import { GameState } from '../game.state';
import { Action, ActionType } from '../action';
import { Decision } from './decision';
import { resolveMoveAction, resolveTransferAction, resolveUnknownAction } from './resolve';

export const decide = (state: GameState, action: Action): Decision => {
    switch (action.type) {
        case ActionType.MOVE:
            return resolveMoveAction(state, action);
        case ActionType.TRANSFER:
            return resolveTransferAction(state, action);
        case ActionType.UNKNOWN:
            return resolveUnknownAction(state, action);
        case ActionType.LOOK:
        case ActionType.INTERACT:
        case ActionType.INVENTORY:
        case ActionType.HELP:
        case ActionType.QUIT:
        default:
            return {
                outcome: { result: 'success' },
                effects: [],
            };
    }
};
