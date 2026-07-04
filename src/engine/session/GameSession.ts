import { Action } from '../action';
import { Factories } from '../context';
import { StateManager } from '../transaction';
import { GameState } from '../state';
import { DeepReadonly } from '../../utils/types';
import { PlayableSession } from './PlayableSession';
import { DefaultActionExecution } from './DefaultActionExecution';

export class GameSession implements PlayableSession {
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
        const input = action.schema.parse(rawInput);

        const tx = this.stateManager.beginTransaction();
        const execution = new DefaultActionExecution(tx, this.factories);
        try {
            return execution.play(action, input);
        } finally {
            if (execution.wasSuccessful()) {
                this.stateManager.commit(tx);
            } else {
                this.stateManager.rollback(tx);
            }
        }
    }
}
