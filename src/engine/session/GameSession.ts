import { Action } from '../action';
import { Context, Factories, GameContext } from '../context';
import { StateManager, Transaction } from '../transaction';
import { GameState } from '../state';
import { DeepReadonly } from '../../utils/types';
import { PlayableSession } from './PlayableSession';
import { OnTurnEffect } from './OnTurnEffect';

export class GameSession implements PlayableSession {
    private readonly stateManager: StateManager;

    constructor(
        initialState: GameState,
        private readonly factories: Factories,
        private readonly onTurnEffects: readonly OnTurnEffect[] = [],
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
                this.advanceTurn(context);
                succeeded = true;
            }
            return outcome;
        } finally {
            this.settle(tx, succeeded);
        }
    }

    private advanceTurn(context: Context): void {
        context.turnCounter().increment();
        this.onTurnEffects.forEach((effect) => effect.apply(context));
    }

    private settle(tx: Transaction, succeeded: boolean): void {
        if (succeeded) {
            this.stateManager.commit(tx);
        } else {
            this.stateManager.rollback(tx);
        }
    }
}
