import { GameMaster } from '../GameMaster';
import { PlayableSession } from '../../engine/session';
import { LLMLoop } from './loop';
import { TurnLifecycle } from './lifecycle';

export class LLMGameMaster implements GameMaster {
    constructor(
        private readonly session: PlayableSession,
        private readonly llmLoop: LLMLoop,
        private readonly turnLifecycle: TurnLifecycle,
    ) {}

    handleInput(rawText: string): ReadableStream<string> {
        return new ReadableStream<string>({
            start: async (controller) => {
                try {
                    const narration = await this.handleTurn(rawText);
                    controller.enqueue(narration);
                    controller.close();
                } catch (error) {
                    controller.error(error);
                }
            },
        });
    }

    private async handleTurn(rawText: string): Promise<string> {
        const turn = this.turnLifecycle.begin(this.session.getState(), rawText);
        const result = await this.llmLoop.run(this.session, turn);
        return this.turnLifecycle.end(result);
    }
}
