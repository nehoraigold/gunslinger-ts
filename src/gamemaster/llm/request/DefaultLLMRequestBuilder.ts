import { LLMRequestBuilder } from './LLMRequestBuilder';
import { LLMRequest } from '../LLMRequest';
import { InstructionsProvider } from '../instructions';
import { WorldSnapshotBuilder } from '../snapshot';
import { ToolCatalog, ToolCall, ToolResult } from '../tool';
import { ConversationManager, ConversationMessage } from '../conversation';
import { GameState } from '../../../engine/state';
import { DeepReadonly } from '../../../utils/types';

export class DefaultLLMRequestBuilder implements LLMRequestBuilder {
    constructor(
        private readonly instructionsProvider: InstructionsProvider,
        private readonly worldSnapshotBuilder: WorldSnapshotBuilder,
        private readonly toolCatalog: ToolCatalog,
    ) {}

    buildFromPlayerInput(
        conversationManager: ConversationManager,
        state: DeepReadonly<GameState>,
        rawInput: string,
    ): LLMRequest {
        const snapshot = this.worldSnapshotBuilder.build(state);
        const userMessage: ConversationMessage = { role: 'user', text: `${rawInput}\n\n${snapshot}` };
        return this.build(conversationManager, [userMessage]);
    }

    buildFromToolResults(
        conversationManager: ConversationManager,
        toolCalls: ToolCall[],
        results: ToolResult[],
        assistantText?: string,
    ): LLMRequest {
        const assistantMessage: ConversationMessage = { role: 'assistant', text: assistantText, toolCalls };
        const resultsMessage: ConversationMessage = { role: 'tool_results', results };
        return this.build(conversationManager, [assistantMessage, resultsMessage]);
    }

    private build(conversationManager: ConversationManager, newMessages: ConversationMessage[]): LLMRequest {
        return {
            systemPrompt: this.instructionsProvider.getSystemPrompt(),
            messages: [...conversationManager.getMessagesForNextRequest(), ...newMessages],
            tools: this.toolCatalog.listDefinitions(),
        };
    }
}
