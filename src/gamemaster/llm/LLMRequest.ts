import { ConversationMessage } from './conversation';
import { ToolDefinition } from './tool';

export type LLMRequest = {
    systemPrompt: string;
    messages: ConversationMessage[];
    tools: ToolDefinition[];
};
