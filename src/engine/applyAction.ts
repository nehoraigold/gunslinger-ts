import { GameState } from './game.state';
import { Action, ActionType } from '../action';
import { applyMove, applyTransfer, ReducerResult } from '../reducer';

export const applyAction = (state: GameState, action: Action): ReducerResult => {
    switch (action.type) {
        case ActionType.MOVE:
            return applyMove(state, action.data.direction);
        case ActionType.TRANSFER:
            return applyTransfer(state, action);
        case ActionType.UNKNOWN:
            return {
                state,
                outcome: {
                    result: 'no_change',
                    reasons: [action.data.reason],
                },
            };
        case ActionType.LOOK:
        case ActionType.INTERACT:
        case ActionType.INVENTORY:
        case ActionType.HELP:
        case ActionType.QUIT:
            break;
    }
    return {
        state,
        outcome: {
            result: 'success',
        },
    };
};
