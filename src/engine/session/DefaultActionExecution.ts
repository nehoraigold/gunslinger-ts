import { Action } from '../action';
import { Context } from '../context';
import { ActionExecution } from './ActionExecution';

export class DefaultActionExecution implements ActionExecution {
    private used = false;

    play<InputT, OutcomeT extends { result: 'success' | 'failure' }>(
        context: Context,
        action: Action<InputT, OutcomeT>,
        input: InputT,
    ): OutcomeT {
        if (this.used) {
            throw new Error('ActionExecution allows only one action to be performed');
        }
        this.used = true;

        return action.execute(context, input);
    }
}
