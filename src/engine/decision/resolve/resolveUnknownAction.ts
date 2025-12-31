import { GameState } from '../../index';
import { UnknownAction } from '../../action';
import { Decision } from '../decision';

export const resolveUnknownAction = (_state: GameState, { data }: UnknownAction): Decision => {
    return {
        outcome: {
            result: 'error',
            reasons: [{ messageKey: data.reason, context: { details: data.message } }],
        },
    };
};
