import { LLMRequest } from './LLMRequest';
import { LLMResponse } from './LLMResponse';

export interface LLMClient {
    complete(request: LLMRequest): Promise<LLMResponse>;
    stream(request: LLMRequest, onChunk: (text: string) => void): Promise<LLMResponse>;
}
