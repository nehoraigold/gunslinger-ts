import { GameState } from '../engine';
import { UnknownAction } from '../action';
import { ReducerResult } from './reducer.result';

export const applyUnknown = (state: GameState, action: UnknownAction): ReducerResult => {
    return {
        state,
        outcome: {
            result: 'invalid',
            reasons: [action.data.reason],
        },
    };
};
