import { TurnStrategy } from '../TurnStrategy';
import { TurnOutput } from '../TurnOutput';
import { PlayableSession } from '../../engine/session';
import { LLMLoop } from './loop';
import { TurnLifecycle } from './lifecycle';

export class LLMTurnStrategy implements TurnStrategy {
    constructor(
        private readonly llmLoop: LLMLoop,
        private readonly turnLifecycle: TurnLifecycle,
    ) {}

    async takeTurn(session: PlayableSession, rawInput: string): Promise<TurnOutput> {
        const turn = this.turnLifecycle.begin(session.getState(), rawInput);
        const result = await this.llmLoop.run(session, turn);
        const narration = this.turnLifecycle.end(result);
        return { narration, choices: [] };
    }
}
