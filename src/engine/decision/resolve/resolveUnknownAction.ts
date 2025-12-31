import { GameState } from '../../index';
import { UnknownAction } from '../../action';
import { Decision } from '../decision';

export const resolveUnknownAction = (state: GameState, { data }: UnknownAction): Decision => {
    return {
        outcome: {
            result: 'error',
            reasons: [{ message: data.reason, context: { details: data.message } }],
        },
        effects: [],
    };
};
