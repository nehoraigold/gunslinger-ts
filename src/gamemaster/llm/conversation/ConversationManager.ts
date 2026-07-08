import { ConversationMessage } from './ConversationMessage';

export interface ConversationManager {
    appendTurn(messages: ConversationMessage[]): void;
    getMessagesForNextRequest(): ConversationMessage[];
    clear(): void;
}
