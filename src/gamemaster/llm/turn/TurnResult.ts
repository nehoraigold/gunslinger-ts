import { ConversationMessage } from '../conversation';

export type TurnResult = {
    text: string;
    messages: ConversationMessage[];
};
