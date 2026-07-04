import { ConversationMessage } from './ConversationMessage';
import { LLMClient } from '../LLMClient';

export interface ConversationManager {
    appendTurn(messages: ConversationMessage[]): void;
    getMessagesForNextRequest(): ConversationMessage[];
    shouldCompress(): boolean;
    compressAsync(llmClient: LLMClient): void;
}
