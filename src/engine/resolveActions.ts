import { GameState } from './game.state';
import { Action, ActionType, ResolvedAction } from '../action';
import { applyMove, applyTransfer, ReducerResult } from '../reducer';
import { applyUnknown } from '../reducer/unknown.reducer';

export const resolveActions = (
    state: GameState,
    actions: Action[],
): { state: GameState; resolvedActions: ResolvedAction[] } => {
    let newState = state;
    const resolvedActions: ResolvedAction[] = [];
    for (const action of actions) {
        const { state: nextState, outcome } = resolveAction(newState, action);
        newState = nextState;
        resolvedActions.push({ action, outcome });
        if (outcome.result !== 'success') {
            // if unsuccessful, do not process any further actions
            break;
        }
    }
    return {
        state: newState,
        resolvedActions,
    };
};

const resolveAction = (state: GameState, action: Action): ReducerResult => {
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
