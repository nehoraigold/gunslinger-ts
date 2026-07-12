import { GameMaster } from './GameMaster';
import { TurnStrategy } from './TurnStrategy';
import { ChoiceResolver } from './ChoiceResolver';
import { TurnOutput } from './TurnOutput';
import { AvailableChoice } from './choice';
import { PlayableSession } from '../engine/session';

export class StreamingGameMaster implements GameMaster {
    private choices: AvailableChoice[] = [];

    constructor(
        private readonly session: PlayableSession,
        private readonly turnStrategy: TurnStrategy & ChoiceResolver,
    ) {}

    handleInput(rawText: string): ReadableStream<string> {
        return this.streamOutput(this.turnStrategy.takeTurn(this.session, rawText));
    }

    selectChoice(choiceId: string): ReadableStream<string> {
        return this.streamOutput(this.turnStrategy.selectChoice(this.session, choiceId));
    }

    currentChoices(): AvailableChoice[] {
        return this.choices;
    }

    private streamOutput(output: Promise<TurnOutput>): ReadableStream<string> {
        return new ReadableStream<string>({
            start: async (controller) => {
                try {
                    const result = await output;
                    this.choices = result.choices;
                    controller.enqueue(result.narration);
                    controller.close();
                } catch (error) {
                    controller.error(error);
                }
            },
        });
    }
}
