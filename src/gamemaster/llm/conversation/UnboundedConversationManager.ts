import { ConversationManager } from './ConversationManager';
import { ConversationMessage } from './ConversationMessage';

export class UnboundedConversationManager implements ConversationManager {
    private messages: ConversationMessage[] = [];

    appendTurn(messages: ConversationMessage[]): void {
        this.messages.push(...messages);
    }

    getMessagesForNextRequest(): ConversationMessage[] {
        return [...this.messages];
    }

    clear(): void {
        this.messages = [];
    }
}
