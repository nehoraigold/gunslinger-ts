import { PlayableSession } from '../../../engine/session';
import { ParseError } from '../../../utils/schema';
import { ToolCallDispatcher } from './ToolCallDispatcher';
import { ToolCatalog } from './ToolCatalog';
import { ToolCall } from './ToolCall';
import { ToolResult } from './ToolResult';

type DispatcherFailureReason = 'unknown_tool' | 'invalid_input' | 'internal_error';

export class DefaultToolCallDispatcher implements ToolCallDispatcher {
    constructor(private readonly catalog: ToolCatalog) {}

    dispatch(session: PlayableSession, call: ToolCall): ToolResult {
        const entry = this.catalog.find(call.name);
        if (!entry) {
            return this.toFailureResult(call, 'unknown_tool');
        }

        try {
            return this.toResult(call, session.playTurn(entry.action, call.args));
        } catch (error) {
            if (error instanceof ParseError) {
                return this.toFailureResult(call, 'invalid_input');
            }
            return this.toFailureResult(call, 'internal_error');
        }
    }

    private toFailureResult(call: ToolCall, reason: DispatcherFailureReason): ToolResult {
        return this.toResult(call, { result: 'failure' as const, reason, message: undefined });
    }

    private toResult(call: ToolCall, outcome: unknown): ToolResult {
        return { callId: call.id, name: call.name, content: JSON.stringify(outcome) };
    }
}
