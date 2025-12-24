import { GameState } from './game.state';
import { Action, ActionType } from '../action';
import { applyMove } from '../reducer';

export const applyAction = (gameState: GameState, action: Action): GameState => {
    switch (action.type) {
        case ActionType.MOVE: {
            return applyMove(gameState, action.data.direction);
        }
        default:
            return gameState;
    }
};
