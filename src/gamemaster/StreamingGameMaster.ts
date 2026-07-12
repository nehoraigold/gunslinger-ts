import { GameMaster } from './GameMaster';
import { TurnStrategy } from './TurnStrategy';
import { ChoiceResolver } from './ChoiceResolver';
import { AvailableChoice } from './choice';
import { PlayableSession } from '../engine/session';

export class StreamingGameMaster implements GameMaster {
    private choices: AvailableChoice[] = [];

    constructor(
        private readonly session: PlayableSession,
        private readonly turnStrategy: TurnStrategy,
        private readonly choiceResolver: ChoiceResolver,
    ) {}

    handleInput(rawText: string): ReadableStream<string> {
        return this.streamOutput(() => this.turnStrategy.takeTurn(this.session, rawText));
    }

    selectChoice(choiceId: string): ReadableStream<string> {
        return this.streamOutput(() => this.choiceResolver.selectChoice(this.session, choiceId));
    }

    currentChoices(): AvailableChoice[] {
        return this.choices;
    }

    private streamOutput(produceNarration: () => Promise<string>): ReadableStream<string> {
        return new ReadableStream<string>({
            start: async (controller) => {
                try {
                    const narration = await produceNarration();
                    this.choices = this.choiceResolver.refreshChoices(this.session);
                    controller.enqueue(narration);
                    controller.close();
                } catch (error) {
                    controller.error(error);
                }
            },
        });
    }
}
