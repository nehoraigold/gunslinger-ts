import { Action } from '../action';
import { Context, Factories, GameContext } from '../context';
import { StateManager, Transaction } from '../transaction';
import { GameState } from '../state';
import { DeepReadonly } from '../../utils/types';
import { PlayableSession } from './PlayableSession';
import { OnTickEffect } from './OnTickEffect';

export class GameSession implements PlayableSession {
    private readonly stateManager: StateManager;

    constructor(
        initialState: GameState,
        private readonly factories: Factories,
        private readonly onTickEffects: readonly OnTickEffect[] = [],
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
        let succeeded = false;
        try {
            const outcome = action.execute(context, input);
            if (outcome.result === 'success') {
                this.tick(context);
                succeeded = true;
            }
            return outcome;
        } finally {
            this.settle(tx, succeeded);
        }
    }

    private tick(context: Context): void {
        context.turnCounter().advance();
        this.onTickEffects.forEach((effect) => effect.apply(context));
    }

    private settle(tx: Transaction, succeeded: boolean): void {
        if (succeeded) {
            this.stateManager.commit(tx);
        } else {
            this.stateManager.rollback(tx);
        }
    }
}
