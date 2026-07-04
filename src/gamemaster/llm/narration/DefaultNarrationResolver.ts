import { NarrationResolver, PreparedTurn, ResolvedTurn } from './NarrationResolver';
import { GameState } from '../../../engine/state';
import { DeepReadonly } from '../../../utils/types';
import { LLMRequestBuilder } from '../request';
import { ConversationManager } from '../conversation';

export class DefaultNarrationResolver implements NarrationResolver {
    constructor(
        private readonly requestBuilder: LLMRequestBuilder,
        private readonly conversationManager: ConversationManager,
    ) {}

    prepare(state: DeepReadonly<GameState>, rawInput: string): PreparedTurn {
        const priorMessages = this.conversationManager.getMessagesForNextRequest();
        const built = this.requestBuilder.buildFromPlayerInput(priorMessages, state, rawInput);
        return { priorMessages, request: built.request, messages: built.newMessages };
    }

    resolve(result: ResolvedTurn): string {
        this.conversationManager.appendTurn(result.messages);
        return result.text;
    }
}
