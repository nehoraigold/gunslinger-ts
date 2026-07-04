import { GameMaster } from '../GameMaster';
import { PlayableSession } from '../../engine/session';
import { LLMLoop } from './loop';
import { NarrationResolver } from './narration';

export class LLMGameMaster implements GameMaster {
    constructor(
        private readonly session: PlayableSession,
        private readonly llmLoop: LLMLoop,
        private readonly narrationResolver: NarrationResolver,
    ) {}

    handleInput(rawText: string): ReadableStream<string> {
        return new ReadableStream<string>({
            start: async (controller) => {
                try {
                    const narration = await this.resolveTurn(rawText);
                    controller.enqueue(narration);
                    controller.close();
                } catch (error) {
                    controller.error(error);
                }
            },
        });
    }

    private async resolveTurn(rawText: string): Promise<string> {
        const prepared = this.narrationResolver.prepare(this.session.getState(), rawText);
        const result = await this.llmLoop.run(this.session, prepared);
        return this.narrationResolver.resolve(result);
    }
}
