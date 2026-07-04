import { LLMLoop } from './LLMLoop';
import { MaxRoundsExceededError } from './error/MaxRoundsExceededError';
import { PlayableSession } from '../../../engine/session';
import { LLMClient } from '../LLMClient';
import { LLMRequestAssembler } from '../request';
import { ToolCallDispatcher } from '../tool';
import { TurnDraft, TurnResult } from '../turn';

const DEFAULT_MAX_ROUNDS = 10;

export class SequentialLLMLoop implements LLMLoop {
    constructor(
        private readonly llmClient: LLMClient,
        private readonly requestAssembler: LLMRequestAssembler,
        private readonly toolCallDispatcher: ToolCallDispatcher,
        private readonly maxRounds: number = DEFAULT_MAX_ROUNDS,
    ) {}

    async run(session: PlayableSession, turn: TurnDraft): Promise<TurnResult> {
        for (let round = 0; round < this.maxRounds; round++) {
            const request = this.requestAssembler.assemble(turn);
            const response = await this.llmClient.complete(request);

            if (!response.toolCalls?.length) {
                return turn.complete(response.text ?? '');
            }

            const results = response.toolCalls.map((call) => this.toolCallDispatcher.dispatch(session, call));
            turn.recordToolRound(response.toolCalls, results, response.text);
        }

        throw new MaxRoundsExceededError(this.maxRounds);
    }
}
