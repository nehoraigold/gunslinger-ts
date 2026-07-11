import { TurnDraft } from './TurnDraft';
import { TurnResult } from './TurnResult';
import { ConversationMessage } from '../conversation';
import { ActionInvocation, ActionResult } from '../../dispatch';

export class DefaultTurnDraft implements TurnDraft {
    private readonly newMessages: ConversationMessage[] = [];

    private constructor(private readonly priorMessages: ConversationMessage[]) {}

    static start(priorMessages: ConversationMessage[]): TurnDraft {
        return new DefaultTurnDraft(priorMessages);
    }

    toRequestMessages(): ConversationMessage[] {
        return [...this.priorMessages, ...this.newMessages];
    }

    recordUserRound(text: string): void {
        this.newMessages.push({ role: 'user', text });
    }

    recordToolRound(toolCalls: ActionInvocation[], results: ActionResult[], assistantText?: string): void {
        this.newMessages.push({ role: 'assistant', text: assistantText, toolCalls });
        this.newMessages.push({ role: 'tool_results', results });
    }

    complete(text: string): TurnResult {
        this.newMessages.push({ role: 'assistant', text });
        return { text, messages: [...this.newMessages] };
    }
}
