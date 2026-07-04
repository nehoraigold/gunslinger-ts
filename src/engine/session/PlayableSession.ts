import { Action } from '../action';
import { GameState } from '../state';
import { DeepReadonly } from '../../utils/types';

export interface PlayableSession {
    getState(): DeepReadonly<GameState>;

    playTurn<InputT, OutcomeT extends { result: 'success' | 'failure' }>(
        action: Action<InputT, OutcomeT>,
        rawInput: unknown,
    ): OutcomeT;
}
