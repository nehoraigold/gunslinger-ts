import { LLMRequestBuilder, BuiltRequest } from './LLMRequestBuilder';
import { InstructionsProvider } from '../instructions';
import { WorldSnapshotBuilder } from '../snapshot';
import { ToolDefinition, ToolCall, ToolResult } from '../tool';
import { ConversationMessage } from '../conversation';
import { GameState } from '../../../engine/state';
import { DeepReadonly } from '../../../utils/types';

export class DefaultLLMRequestBuilder implements LLMRequestBuilder {
    constructor(
        private readonly instructionsProvider: InstructionsProvider,
        private readonly worldSnapshotBuilder: WorldSnapshotBuilder,
        private readonly toolDefinitions: ToolDefinition[],
    ) {}

    buildFromPlayerInput(
        priorMessages: ConversationMessage[],
        state: DeepReadonly<GameState>,
        rawInput: string,
    ): BuiltRequest {
        const snapshot = this.worldSnapshotBuilder.build(state);
        const userMessage: ConversationMessage = { role: 'user', text: `${rawInput}\n\n${snapshot}` };
        return this.build(priorMessages, [userMessage]);
    }

    buildFromToolResults(
        priorMessages: ConversationMessage[],
        toolCalls: ToolCall[],
        results: ToolResult[],
        assistantText?: string,
    ): BuiltRequest {
        const assistantMessage: ConversationMessage = { role: 'assistant', text: assistantText, toolCalls };
        const resultsMessage: ConversationMessage = { role: 'tool_results', results };
        return this.build(priorMessages, [assistantMessage, resultsMessage]);
    }

    private build(priorMessages: ConversationMessage[], newMessages: ConversationMessage[]): BuiltRequest {
        return {
            request: {
                systemPrompt: this.instructionsProvider.getSystemPrompt(),
                messages: [...priorMessages, ...newMessages],
                tools: this.toolDefinitions,
            },
            newMessages,
        };
    }
}
