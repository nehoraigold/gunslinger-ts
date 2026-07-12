import { ChatResponse } from 'ollama';
import { getLogger } from '../../../utils/logger';
import { LLMClient } from '../LLMClient';
import { LLMRequest } from '../LLMRequest';
import { LLMResponse } from '../LLMResponse';
import { OllamaChatClient } from './OllamaChatClient';
import { toOllamaMessages } from './toOllamaMessages';
import { toOllamaTools } from './toOllamaTools';
import { fromOllamaResponse } from './fromOllamaResponse';

const log = getLogger('llm.ollama');

export class OllamaLLMClient implements LLMClient {
    constructor(
        private readonly ollama: OllamaChatClient,
        private readonly model: string,
    ) {}

    async complete(request: LLMRequest): Promise<LLMResponse> {
        const messages = toOllamaMessages(request);
        log.debug('request', { model: this.model, messages: messages.length, tools: request.tools.length });
        try {
            const response = await this.ollama.chat({
                model: this.model,
                stream: false,
                messages,
                tools: toOllamaTools(request.tools),
            });
            const parsed = fromOllamaResponse(response);
            log.debug('response', { textChars: parsed.text?.length ?? 0, toolCalls: parsed.toolCalls?.length ?? 0 });
            return parsed;
        } catch (error) {
            log.error('request failed', { model: this.model, message: this.messageFor(error) });
            throw error;
        }
    }

    async stream(request: LLMRequest, onChunk: (text: string) => void): Promise<LLMResponse> {
        let lastChunk: ChatResponse | null = null;
        try {
            const stream = await this.ollama.chat({
                model: this.model,
                stream: true,
                messages: toOllamaMessages(request),
                tools: toOllamaTools(request.tools),
            });

            let accumulatedContent = '';

            for await (const chunk of stream) {
                const content = chunk.message?.content;
                if (content) {
                    accumulatedContent += content;
                    onChunk(content);
                }
                lastChunk = chunk;
            }

            if (!lastChunk) {
                log.warn('stream produced no chunks', { model: this.model });
                return { text: undefined, toolCalls: undefined };
            }

            return fromOllamaResponse({ ...lastChunk, message: { ...lastChunk.message, content: accumulatedContent } });
        } catch (error) {
            log.error('stream request failed', { model: this.model, message: this.messageFor(error) });
            throw error;
        }
    }

    private messageFor(error: unknown): string {
        return error instanceof Error ? error.message : String(error);
    }
}
