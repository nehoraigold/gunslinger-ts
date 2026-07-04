import { ToolCall } from './tool';

export type AssistantTurn = {
    text?: string;
    toolCalls?: ToolCall[];
};
