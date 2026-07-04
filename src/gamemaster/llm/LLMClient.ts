import { LLMRequest } from './LLMRequest';
import { AssistantTurn } from './AssistantTurn';

export interface LLMClient {
    complete(request: LLMRequest): Promise<AssistantTurn>;
    stream(request: LLMRequest, onChunk: (text: string) => void): Promise<AssistantTurn>;
}
