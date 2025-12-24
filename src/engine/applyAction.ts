import { GameState } from './game.state';
import { Action, ActionType } from '../action';
import { applyMove, applyTransfer } from '../reducer';

export const applyAction = (gameState: GameState, action: Action): GameState => {
    switch (action.type) {
        case ActionType.MOVE:
            return applyMove(gameState, action.data.direction);
        case ActionType.TRANSFER:
            return applyTransfer(gameState, action);
        case ActionType.LOOK:
        case ActionType.INTERACT:
        case ActionType.INVENTORY:
        case ActionType.HELP:
        case ActionType.QUIT:
        case ActionType.UNKNOWN:
            break;
    }
    return gameState;
};
