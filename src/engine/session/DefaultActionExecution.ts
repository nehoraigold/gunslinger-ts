import { Action } from '../action';
import { Context, GameContext, Factories } from '../context';
import { Transaction } from '../transaction';
import { ActionExecution } from './ActionExecution';

export class DefaultActionExecution implements ActionExecution {
    private used = false;
    private succeeded = false;

    constructor(
        private readonly tx: Transaction,
        private readonly factories: Factories,
    ) {}

    play<InputT, OutcomeT extends { result: 'success' | 'failure' }>(
        action: Action<InputT, OutcomeT>,
        input: InputT,
    ): OutcomeT {
        if (this.used) {
            throw new Error('ActionExecution allows only one action to be performed');
        }
        this.used = true;

        const ctx: Context = new GameContext(this.tx, this.factories);
        const outcome = action.execute(ctx, input);
        this.succeeded = outcome.result === 'success';
        return outcome;
    }

    wasSuccessful(): boolean {
        return this.succeeded;
    }
}
