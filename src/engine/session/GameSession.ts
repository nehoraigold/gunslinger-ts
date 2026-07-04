import { Action } from '../action';
import { Context, GameContext, Factories } from '../context';
import { GameTransaction } from '../transaction';
import { GameState } from '../state';
import { DeepReadonly } from '../../utils/types';

export class GameSession {
    private state: DeepReadonly<GameState>;

    constructor(
        initialState: GameState,
        private readonly factories: Factories,
    ) {
        this.state = initialState;
    }

    getState(): DeepReadonly<GameState> {
        return this.state;
    }

    perform<InputT, OutcomeT extends { result: 'success' | 'failure' }>(
        action: Action<InputT, OutcomeT>,
        rawInput: unknown,
    ): OutcomeT {
        const input = action.inputParser.parse(rawInput);
        const tx = new GameTransaction(this.state);
        const ctx: Context = new GameContext(tx, this.factories);
        const outcome = action.execute(ctx, input);
        if (outcome.result === 'success') {
            this.state = tx.commit();
        }
        return outcome;
    }
}
