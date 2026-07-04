import { GameState } from '../../../engine/state';
import { DeepReadonly } from '../../../utils/types';
import { ConversationManager } from '../conversation';
import { ToolCall, ToolResult } from '../tool';
import { LLMRequest } from '../LLMRequest';

export interface LLMRequestBuilder {
    buildFromPlayerInput(
        conversationManager: ConversationManager,
        state: DeepReadonly<GameState>,
        rawInput: string,
    ): LLMRequest;

    buildFromToolResults(
        conversationManager: ConversationManager,
        toolCalls: ToolCall[],
        results: ToolResult[],
        assistantText?: string,
    ): LLMRequest;
}
