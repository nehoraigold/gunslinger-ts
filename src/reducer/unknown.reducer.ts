import { GameState } from '../engine';
import { UnknownAction } from '../action';
import { ReducerResult } from './reducer.result';

export const applyUnknown = (state: GameState, { data }: UnknownAction): ReducerResult => {
    return {
        state,
        outcome: {
            result: 'error',
            reasons: [{ message: data.reason, context: { details: data.message } }],
        },
    };
};
