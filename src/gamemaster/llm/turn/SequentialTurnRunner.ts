import { TurnRunner } from './TurnRunner';
import { GameSession } from '../../../engine/session';
import { LLMClient } from '../LLMClient';
import { LLMRequestBuilder } from '../request';
import { ToolCallDispatcher } from '../tool';
import { ConversationManager, ConversationMessage } from '../conversation';

const DEFAULT_MAX_ROUNDS = 10;

export class SequentialTurnRunner implements TurnRunner {
    constructor(
        private readonly llmClient: LLMClient,
        private readonly requestBuilder: LLMRequestBuilder,
        private readonly toolCallDispatcher: ToolCallDispatcher,
        private readonly maxRounds: number = DEFAULT_MAX_ROUNDS,
    ) {}

    runTurn(session: GameSession, conversationManager: ConversationManager, rawInput: string): ReadableStream<string> {
        return new ReadableStream<string>({
            start: async (controller) => {
                try {
                    const narration = await this.run(session, conversationManager, rawInput);
                    controller.enqueue(narration);
                    controller.close();
                } catch (error) {
                    controller.error(error);
                }
            },
        });
    }

    private async run(
        session: GameSession,
        conversationManager: ConversationManager,
        rawInput: string,
    ): Promise<string> {
        const priorMessages = conversationManager.getMessagesForNextRequest();
        const turnMessages: ConversationMessage[] = [];

        let built = this.requestBuilder.buildFromPlayerInput(
            [...priorMessages, ...turnMessages],
            session.getState(),
            rawInput,
        );
        turnMessages.push(...built.newMessages);

        for (let round = 0; round < this.maxRounds; round++) {
            const response = await this.llmClient.complete(built.request);

            if (!response.toolCalls?.length) {
                turnMessages.push({ role: 'assistant', text: response.text });
                conversationManager.appendTurn(turnMessages);
                return response.text ?? '';
            }

            const results = response.toolCalls.map((call) => this.toolCallDispatcher.dispatch(session, call));
            built = this.requestBuilder.buildFromToolResults(
                [...priorMessages, ...turnMessages],
                response.toolCalls,
                results,
                response.text,
            );
            turnMessages.push(...built.newMessages);
        }

        throw new Error(`Turn exceeded the maximum of ${this.maxRounds} rounds`);
    }
}
