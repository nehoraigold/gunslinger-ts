import { LLMLoop } from './LLMLoop';
import { MaxRoundsExceededError } from './error/MaxRoundsExceededError';
import { PlayableSession } from '../../../engine/session';
import { getLogger } from '../../../utils/logger';
import { LLMClient } from '../LLMClient';
import { LLMRequestAssembler } from '../request';
import { ActionDispatcher } from '../../dispatch';
import { ToolCall, ToolResult } from '../tool';
import { TurnDraft, TurnResult } from '../turn';

const DEFAULT_MAX_ROUNDS = 10;

const log = getLogger('llm.loop');

export class SequentialLLMLoop implements LLMLoop {
    constructor(
        private readonly llmClient: LLMClient,
        private readonly requestAssembler: LLMRequestAssembler,
        private readonly actionDispatcher: ActionDispatcher,
        private readonly maxRounds: number = DEFAULT_MAX_ROUNDS,
    ) {}

    async run(session: PlayableSession, turn: TurnDraft): Promise<TurnResult> {
        for (let round = 0; round < this.maxRounds; round++) {
            const request = this.requestAssembler.assemble(turn);
            const response = await this.llmClient.complete(request);

            if (!response.toolCalls?.length) {
                return turn.complete(response.text ?? '');
            }

            log.debug('tool round', { round, tools: response.toolCalls.map((call) => call.name) });
            const results = response.toolCalls.map((call) => this.invokeAction(session, call));
            turn.recordToolRound(response.toolCalls, results, response.text);
        }

        log.warn('max rounds exceeded', { maxRounds: this.maxRounds });
        throw new MaxRoundsExceededError(this.maxRounds);
    }

    private invokeAction(session: PlayableSession, call: ToolCall): ToolResult {
        const { content } = this.actionDispatcher.dispatch(session, { name: call.name, args: call.args });
        return { callId: call.id, name: call.name, content };
    }
}
