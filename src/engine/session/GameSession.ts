import { Action } from '../action';
import { Factories } from '../context';
import { StateManager } from '../transaction';
import { GameState } from '../state';
import { DeepReadonly } from '../../utils/types';
import { DefaultGameTurn } from './DefaultGameTurn';

export class GameSession {
    private readonly stateManager: StateManager;

    constructor(
        initialState: GameState,
        private readonly factories: Factories,
    ) {
        this.stateManager = new StateManager(initialState);
    }

    getState(): DeepReadonly<GameState> {
        return this.stateManager.getState();
    }

    playTurn<InputT, OutcomeT extends { result: 'success' | 'failure' }>(
        action: Action<InputT, OutcomeT>,
        rawInput: unknown,
    ): OutcomeT {
        const input = action.inputParser.parse(rawInput);

        const tx = this.stateManager.beginTransaction();
        const turn = new DefaultGameTurn(tx, this.factories);
        try {
            return turn.play(action, input);
        } finally {
            if (turn.wasSuccessful()) {
                this.stateManager.commit(tx);
            } else {
                this.stateManager.rollback(tx);
            }
        }
    }
}
