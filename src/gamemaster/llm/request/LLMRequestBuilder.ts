import { GameState } from '../../../engine/state';
import { DeepReadonly } from '../../../utils/types';
import { ConversationMessage } from '../conversation';
import { ToolCall, ToolResult } from '../tool';
import { LLMRequest } from '../LLMRequest';

export type BuiltRequest = {
    request: LLMRequest;
    newMessages: ConversationMessage[];
};

export interface LLMRequestBuilder {
    buildFromPlayerInput(
        priorMessages: ConversationMessage[],
        state: DeepReadonly<GameState>,
        rawInput: string,
    ): BuiltRequest;

    buildFromToolResults(
        priorMessages: ConversationMessage[],
        toolCalls: ToolCall[],
        results: ToolResult[],
        assistantText?: string,
    ): BuiltRequest;
}
