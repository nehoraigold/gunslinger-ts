import { ChatRequest, ChatResponse } from 'ollama';

export interface OllamaChatClient {
    chat(request: ChatRequest & { stream: true }): Promise<AsyncIterable<ChatResponse>>;
    chat(request: ChatRequest & { stream?: false }): Promise<ChatResponse>;
}
