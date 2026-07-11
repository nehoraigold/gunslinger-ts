import { ConversationMessage } from '../conversation';
import { ActionInvocation, ActionResult } from '../../dispatch';
import { TurnResult } from './TurnResult';

export interface TurnDraft {
    toRequestMessages(): ConversationMessage[];

    recordUserRound(text: string): void;

    recordToolRound(toolCalls: ActionInvocation[], results: ActionResult[], assistantText?: string): void;

    complete(text: string): TurnResult;
}
