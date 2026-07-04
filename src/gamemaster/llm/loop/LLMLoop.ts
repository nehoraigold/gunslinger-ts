import { PlayableSession } from '../../../engine/session';
import { LLMRequest } from '../LLMRequest';
import { ConversationMessage } from '../conversation';

export type LLMLoopInput = {
    priorMessages: ConversationMessage[];
    request: LLMRequest;
    messages: ConversationMessage[];
};

export type LLMLoopResult = {
    text: string;
    messages: ConversationMessage[];
};

export interface LLMLoop {
    run(session: PlayableSession, input: LLMLoopInput): Promise<LLMLoopResult>;
}
