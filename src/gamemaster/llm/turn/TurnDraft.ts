import { ConversationMessage } from '../conversation';
import { ToolCall, ToolResult } from '../tool';
import { TurnResult } from './TurnResult';

export interface TurnDraft {
    toRequestMessages(): ConversationMessage[];

    recordUserRound(text: string): void;

    recordToolRound(toolCalls: ToolCall[], results: ToolResult[], assistantText?: string): void;

    complete(text: string): TurnResult;
}
