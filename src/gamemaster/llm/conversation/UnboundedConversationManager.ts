import { ConversationManager } from './ConversationManager';
import { ConversationMessage } from './ConversationMessage';
import { LLMClient } from '../LLMClient';

/** Keeps the full conversation history at full fidelity and never compresses it. */
export class UnboundedConversationManager implements ConversationManager {
    private readonly messages: ConversationMessage[] = [];

    appendTurn(messages: ConversationMessage[]): void {
        this.messages.push(...messages);
    }

    getMessagesForNextRequest(): ConversationMessage[] {
        return [...this.messages];
    }

    shouldCompress(): boolean {
        return false;
    }

    compressAsync(llmClient: LLMClient): void {
        // No-op: this implementation never compresses history.
    }
}
