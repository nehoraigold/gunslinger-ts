import { PlayableSession } from '../../../engine/session';
import { getLogger } from '../../../utils/logger';
import { ParseError } from '../../../utils/schema';
import { ToolCallDispatcher } from './ToolCallDispatcher';
import { ToolCatalog } from './ToolCatalog';
import { ToolCall } from './ToolCall';
import { ToolResult } from './ToolResult';

type DispatcherFailureReason = 'unknown_tool' | 'invalid_input' | 'internal_error';

const log = getLogger('llm.tool');

export class DefaultToolCallDispatcher implements ToolCallDispatcher {
    constructor(private readonly catalog: ToolCatalog) {}

    dispatch(session: PlayableSession, call: ToolCall): ToolResult {
        log.debug('dispatch', { tool: call.name, args: call.args });
        const entry = this.catalog.find(call.name);
        if (!entry) {
            log.warn('unknown tool', { tool: call.name });
            return this.toFailureResult(call, 'unknown_tool');
        }

        try {
            return this.toResult(call, session.playTurn(entry.action, call.args));
        } catch (error) {
            if (error instanceof ParseError) {
                log.warn('invalid tool input', { tool: call.name });
                return this.toFailureResult(call, 'invalid_input');
            }
            log.error('tool internal error', { tool: call.name, message: this.messageFor(error) });
            return this.toFailureResult(call, 'internal_error', this.messageFor(error));
        }
    }

    private toFailureResult(call: ToolCall, reason: DispatcherFailureReason, message?: string): ToolResult {
        return this.toResult(call, { result: 'failure' as const, reason, message });
    }

    private messageFor(error: unknown): string | undefined {
        return error instanceof Error ? error.message : undefined;
    }

    private toResult(call: ToolCall, outcome: unknown): ToolResult {
        const result: ToolResult = { callId: call.id, name: call.name, content: JSON.stringify(outcome) };
        log.debug('result', { tool: call.name, content: result.content });
        return result;
    }
}
