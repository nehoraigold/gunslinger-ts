import { ActionInvocation, ActionResult } from '../../dispatch';

export type ConversationMessage =
    | { role: 'user'; text: string }
    | { role: 'assistant'; text?: string; toolCalls?: ActionInvocation[] }
    | { role: 'tool_results'; results: ActionResult[] };
