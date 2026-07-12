import { Action } from '../action';
import { Context, Factories, GameContext } from '../context';
import { StateManager, Transaction } from '../transaction';
import { GameState } from '../state';
import { DeepReadonly } from '../../utils/types';
import { getLogger } from '../../utils/logger';
import { PlayableSession } from './PlayableSession';
import { RestorableSession } from './RestorableSession';
import { OnTurnEffect } from './OnTurnEffect';

const log = getLogger('engine.session');

export class GameSession implements PlayableSession, RestorableSession {
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

    restoreState(state: GameState): void {
        this.stateManager.restore(state);
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
            log.debug('turn played', { action: action.name, result: outcome.result });
            return outcome;
        } catch (error) {
            log.error('action threw', { action: action.name, message: this.messageFor(error) });
            throw error;
        } finally {
            this.settle(tx, succeeded);
        }
    }

    private messageFor(error: unknown): string {
        return error instanceof Error ? error.message : String(error);
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
