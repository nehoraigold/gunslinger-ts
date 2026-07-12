import { GameMaster } from './GameMaster';
import { TurnStrategy } from './TurnStrategy';
import { AvailableChoice, ChoiceProvider } from './choice';
import { PlayableSession } from '../engine/session';
import { getLogger } from '../utils/logger';

const log = getLogger('gamemaster.master');

export class StreamingGameMaster implements GameMaster {
    private choices: AvailableChoice[] = [];

    constructor(
        private readonly session: PlayableSession,
        private readonly turnStrategy: TurnStrategy,
        private readonly choiceTurnStrategy: TurnStrategy,
        private readonly choiceProvider: ChoiceProvider,
    ) {}

    handleInput(rawText: string): ReadableStream<string> {
        return this.streamOutput(() => this.turnStrategy.takeTurn(this.session, rawText));
    }

    selectChoice(choiceId: string): ReadableStream<string> {
        return this.streamOutput(() => this.choiceTurnStrategy.takeTurn(this.session, choiceId));
    }

    currentChoices(): AvailableChoice[] {
        return this.choices;
    }

    private streamOutput(produceNarration: () => Promise<string>): ReadableStream<string> {
        return new ReadableStream<string>({
            start: async (controller) => {
                try {
                    const narration = await produceNarration();
                    this.choices = this.choiceProvider.compute(this.session.getState()).map((o) => o.choice);
                    controller.enqueue(narration);
                    controller.close();
                } catch (error) {
                    log.error('turn failed', { message: error instanceof Error ? error.message : String(error) });
                    controller.error(error);
                }
            },
        });
    }
}
