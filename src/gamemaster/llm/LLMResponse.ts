import { ToolCall } from './tool';

export type LLMResponse = {
    text?: string;
    toolCalls?: ToolCall[];
};
