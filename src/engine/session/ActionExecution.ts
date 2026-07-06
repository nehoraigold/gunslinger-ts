import { Action } from '../action';
import { Context } from '../context';

export interface ActionExecution {
    play<InputT, OutcomeT extends { result: 'success' | 'failure' }>(
        context: Context,
        action: Action<InputT, OutcomeT>,
        input: InputT,
    ): OutcomeT;
}
