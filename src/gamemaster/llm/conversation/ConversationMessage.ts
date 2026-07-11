import { ToolCall, ToolResult } from '../tool';

export type ConversationMessage =
    | { role: 'user'; text: string }
    | { role: 'assistant'; text?: string; toolCalls?: ToolCall[] }
    | { role: 'tool_results'; results: ToolResult[] };
