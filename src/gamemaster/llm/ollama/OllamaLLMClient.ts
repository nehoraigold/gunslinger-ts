import { ChatResponse } from 'ollama';
import { LLMClient } from '../LLMClient';
import { LLMRequest } from '../LLMRequest';
import { AssistantTurn } from '../AssistantTurn';
import { OllamaChatClient } from './OllamaChatClient';
import { toOllamaMessages } from './toOllamaMessages';
import { toOllamaTools } from './toOllamaTools';
import { fromOllamaResponse } from './fromOllamaResponse';

export class OllamaLLMClient implements LLMClient {
    constructor(
        private readonly ollama: OllamaChatClient,
        private readonly model: string,
    ) {}

    async complete(request: LLMRequest): Promise<AssistantTurn> {
        const response = await this.ollama.chat({
            model: this.model,
            stream: false,
            messages: toOllamaMessages(request),
            tools: toOllamaTools(request.tools),
        });
        return fromOllamaResponse(response);
    }

    async stream(request: LLMRequest, onChunk: (text: string) => void): Promise<AssistantTurn> {
        const stream = await this.ollama.chat({
            model: this.model,
            stream: true,
            messages: toOllamaMessages(request),
            tools: toOllamaTools(request.tools),
        });

        let accumulatedContent = '';
        let lastChunk: ChatResponse | null = null;

        for await (const chunk of stream) {
            const content = chunk.message?.content;
            if (content) {
                accumulatedContent += content;
                onChunk(content);
            }
            lastChunk = chunk;
        }

        if (!lastChunk) {
            return { text: undefined, toolCalls: undefined };
        }

        return fromOllamaResponse({ ...lastChunk, message: { ...lastChunk.message, content: accumulatedContent } });
    }
}
