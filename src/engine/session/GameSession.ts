import { Action } from '../action';
import { Context, Factories, GameContext } from '../context';
import { StateManager } from '../transaction';
import { GameState } from '../state';
import { DeepReadonly } from '../../utils/types';
import { PlayableSession } from './PlayableSession';
import { DefaultActionExecution } from './DefaultActionExecution';
import { TurnSystem } from './TurnSystem';

export class GameSession implements PlayableSession {
    private readonly stateManager: StateManager;

    constructor(
        initialState: GameState,
        private readonly factories: Factories,
        private readonly turnSystems: readonly TurnSystem[] = [],
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
        const context = new GameContext(tx, this.factories);
        const execution = new DefaultActionExecution();
        let shouldCommit = false;
        try {
            const outcome = execution.play(context, action, input);
            if (outcome.result === 'success') {
                this.concludeTurn(context);
                shouldCommit = true;
            }
            return outcome;
        } finally {
            if (shouldCommit) {
                this.stateManager.commit(tx);
            } else {
                this.stateManager.rollback(tx);
            }
        }
    }

    private concludeTurn(context: Context): void {
        context.clock().advance();
        for (const system of this.turnSystems) {
            system.run(context);
        }
    }
}
