import { Action } from '../action';

export interface GameTurn {
    play<InputT, OutcomeT extends { result: 'success' | 'failure' }>(
        action: Action<InputT, OutcomeT>,
        input: InputT,
    ): OutcomeT;

    wasSuccessful(): boolean;
}
