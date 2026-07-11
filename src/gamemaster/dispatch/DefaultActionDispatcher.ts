import { PlayableSession } from '../../engine/session';
import { getLogger } from '../../utils/logger';
import { ParseError } from '../../utils/schema';
import { ActionDispatcher } from './ActionDispatcher';
import { ActionInvocation } from './ActionInvocation';
import { ActionResolver } from './ActionResolver';
import { ActionResult } from './ActionResult';

type DispatchFailureReason = 'unknown_action' | 'invalid_input' | 'internal_error';

const log = getLogger('gamemaster.dispatch');

export class DefaultActionDispatcher implements ActionDispatcher {
    constructor(private readonly resolver: ActionResolver) {}

    dispatch(session: PlayableSession, invocation: ActionInvocation): ActionResult {
        log.debug('dispatch', { action: invocation.name, args: invocation.args });
        const action = this.resolver.resolve(invocation.name);
        if (!action) {
            log.warn('unknown action', { action: invocation.name });
            return this.toFailureResult('unknown_action');
        }

        try {
            return this.toResult(session.playTurn(action, invocation.args));
        } catch (error) {
            if (error instanceof ParseError) {
                log.warn('invalid action input', { action: invocation.name });
                return this.toFailureResult('invalid_input');
            }
            log.error('action internal error', { action: invocation.name, message: this.messageFor(error) });
            return this.toFailureResult('internal_error', this.messageFor(error));
        }
    }

    private toFailureResult(reason: DispatchFailureReason, message?: string): ActionResult {
        return this.toResult({ result: 'failure' as const, reason, message });
    }

    private messageFor(error: unknown): string | undefined {
        return error instanceof Error ? error.message : undefined;
    }

    private toResult(outcome: unknown): ActionResult {
        const result: ActionResult = { content: JSON.stringify(outcome) };
        log.debug('result', { content: result.content });
        return result;
    }
}
