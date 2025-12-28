import { GameState } from './game.state';
import { Action, ActionType } from '../action';
import { applyMove, applyTransfer, ReducerResult } from '../reducer';
import { applyUnknown } from '../reducer/unknown.reducer';

export const applyAction = (state: GameState, action: Action): ReducerResult => {
    switch (action.type) {
        case ActionType.MOVE:
            return applyMove(state, action.data.direction);
        case ActionType.TRANSFER:
            return applyTransfer(state, action);
        case ActionType.UNKNOWN:
            return applyUnknown(state, action);
        case ActionType.LOOK:
        case ActionType.INTERACT:
        case ActionType.INVENTORY:
        case ActionType.HELP:
        case ActionType.QUIT:
        default:
            return {
                state,
                outcome: {
                    result: 'success',
                },
            };
    }
};
