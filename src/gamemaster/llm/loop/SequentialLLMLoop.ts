import { LLMLoop, LLMLoopInput, LLMLoopResult } from './LLMLoop';
import { MaxRoundsExceededError } from './error/MaxRoundsExceededError';
import { PlayableSession } from '../../../engine/session';
import { LLMClient } from '../LLMClient';
import { LLMRequestBuilder } from '../request';
import { ToolCallDispatcher } from '../tool';
import { ConversationMessage } from '../conversation';

const DEFAULT_MAX_ROUNDS = 10;

export class SequentialLLMLoop implements LLMLoop {
    constructor(
        private readonly llmClient: LLMClient,
        private readonly requestBuilder: LLMRequestBuilder,
        private readonly toolCallDispatcher: ToolCallDispatcher,
        private readonly maxRounds: number = DEFAULT_MAX_ROUNDS,
    ) {}

    async run(session: PlayableSession, input: LLMLoopInput): Promise<LLMLoopResult> {
        const { priorMessages } = input;
        let request = input.request;
        const messages: ConversationMessage[] = [...input.messages];

        for (let round = 0; round < this.maxRounds; round++) {
            const response = await this.llmClient.complete(request);

            if (!response.toolCalls?.length) {
                messages.push({ role: 'assistant', text: response.text });
                return { text: response.text ?? '', messages };
            }

            const results = response.toolCalls.map((call) => this.toolCallDispatcher.dispatch(session, call));
            const built = this.requestBuilder.buildFromToolResults(
                [...priorMessages, ...messages],
                response.toolCalls,
                results,
                response.text,
            );
            request = built.request;
            messages.push(...built.newMessages);
        }

        throw new MaxRoundsExceededError(this.maxRounds);
    }
}
