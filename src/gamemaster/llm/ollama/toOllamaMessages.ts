import { Message as OllamaMessage } from 'ollama';
import { LLMRequest } from '../LLMRequest';
import { ConversationMessage } from '../conversation';

export function toOllamaMessages(request: LLMRequest): OllamaMessage[] {
    return [{ role: 'system', content: request.systemPrompt }, ...request.messages.flatMap(toOllamaMessage)];
}

function toOllamaMessage(message: ConversationMessage): OllamaMessage[] {
    switch (message.role) {
        case 'user':
            return [{ role: 'user', content: message.text }];

        case 'assistant': {
            const converted: OllamaMessage = { role: 'assistant', content: message.text ?? '' };
            if (message.toolCalls?.length) {
                converted.tool_calls = message.toolCalls.map((call) => ({
                    function: {
                        name: call.name,
                        arguments: call.args as Record<string, unknown>,
                    },
                }));
            }
            return [converted];
        }

        case 'tool_results':
            return message.results.map((result) => ({ role: 'tool', content: result.content }));
    }
}
