import { GameMaster } from './GameMaster';
import { TurnStrategy } from './TurnStrategy';
import { PlayableSession } from '../engine/session';

export class StreamingGameMaster implements GameMaster {
    constructor(
        private readonly session: PlayableSession,
        private readonly turnStrategy: TurnStrategy,
    ) {}

    handleInput(rawText: string): ReadableStream<string> {
        return new ReadableStream<string>({
            start: async (controller) => {
                try {
                    const narration = await this.turnStrategy.takeTurn(this.session, rawText);
                    controller.enqueue(narration);
                    controller.close();
                } catch (error) {
                    controller.error(error);
                }
            },
        });
    }
}
