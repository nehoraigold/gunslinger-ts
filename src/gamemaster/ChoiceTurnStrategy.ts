import { TurnStrategy } from './TurnStrategy';
import { ChoiceResolver } from './ChoiceResolver';
import { TurnOutput } from './TurnOutput';
import { PlayableSession } from '../engine/session';
import { ActionDispatcher } from './dispatch';
import { ChoiceProvider, OfferedChoice } from './choice';
import { OutcomeNarrator } from './OutcomeNarrator';

export class ChoiceTurnStrategy implements TurnStrategy, ChoiceResolver {
    private lastOffered: OfferedChoice[] = [];

    constructor(
        private readonly inner: TurnStrategy,
        private readonly actionDispatcher: ActionDispatcher,
        private readonly choiceProvider: ChoiceProvider,
        private readonly narrator: OutcomeNarrator,
    ) {}

    async takeTurn(session: PlayableSession, rawInput: string): Promise<TurnOutput> {
        const result = await this.inner.takeTurn(session, rawInput);
        return this.attachChoices(session, result.narration);
    }

    async selectChoice(session: PlayableSession, choiceId: string): Promise<TurnOutput> {
        const offered = this.lastOffered.find((o) => o.choice.id === choiceId);
        if (!offered) {
            return { narration: '', choices: this.lastOffered.map((o) => o.choice) };
        }

        const result = this.actionDispatcher.dispatch(session, offered.invocation);
        const narration = await this.narrator.narrate(session, offered.invocation, result);
        return this.attachChoices(session, narration);
    }

    private attachChoices(session: PlayableSession, narration: string): TurnOutput {
        this.lastOffered = this.choiceProvider.compute(session.getState());
        return { narration, choices: this.lastOffered.map((o) => o.choice) };
    }
}
