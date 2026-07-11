import { PlayableSession } from '../../engine/session';
import { getLogger } from '../../utils/logger';
import { ParseError } from '../../utils/schema';
import { ActionDispatcher } from './ActionDispatcher';
import { ActionInvocation } from './ActionInvocation';
import { ActionResolver } from './ActionResolver';
import { ActionResult } from './ActionResult';

type DispatcherFailureReason = 'unknown_tool' | 'invalid_input' | 'internal_error';

const log = getLogger('gamemaster.dispatch');

export class DefaultActionDispatcher implements ActionDispatcher {
    constructor(private readonly resolver: ActionResolver) {}

    dispatch(session: PlayableSession, invocation: ActionInvocation): ActionResult {
        log.debug('dispatch', { tool: invocation.name, args: invocation.args });
        const action = this.resolver.resolve(invocation.name);
        if (!action) {
            log.warn('unknown tool', { tool: invocation.name });
            return this.toFailureResult(invocation, 'unknown_tool');
        }

        try {
            return this.toResult(invocation, session.playTurn(action, invocation.args));
        } catch (error) {
            if (error instanceof ParseError) {
                log.warn('invalid tool input', { tool: invocation.name });
                return this.toFailureResult(invocation, 'invalid_input');
            }
            log.error('tool internal error', { tool: invocation.name, message: this.messageFor(error) });
            return this.toFailureResult(invocation, 'internal_error', this.messageFor(error));
        }
    }

    private toFailureResult(
        invocation: ActionInvocation,
        reason: DispatcherFailureReason,
        message?: string,
    ): ActionResult {
        return this.toResult(invocation, { result: 'failure' as const, reason, message });
    }

    private messageFor(error: unknown): string | undefined {
        return error instanceof Error ? error.message : undefined;
    }

    private toResult(invocation: ActionInvocation, outcome: unknown): ActionResult {
        const result: ActionResult = {
            callId: invocation.id,
            name: invocation.name,
            content: JSON.stringify(outcome),
        };
        log.debug('result', { tool: invocation.name, content: result.content });
        return result;
    }
}
