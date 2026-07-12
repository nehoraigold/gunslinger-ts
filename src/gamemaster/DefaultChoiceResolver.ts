import { ChoiceResolver } from './ChoiceResolver';
import { PlayableSession } from '../engine/session';
import { ActionDispatcher } from './dispatch';
import { AvailableChoice, ChoiceProvider, OfferedChoice } from './choice';
import { OutcomeNarrator } from './OutcomeNarrator';

export class DefaultChoiceResolver implements ChoiceResolver {
    private lastOffered: OfferedChoice[] = [];

    constructor(
        private readonly actionDispatcher: ActionDispatcher,
        private readonly choiceProvider: ChoiceProvider,
        private readonly narrator: OutcomeNarrator,
    ) {}

    refreshChoices(session: PlayableSession): AvailableChoice[] {
        this.lastOffered = this.choiceProvider.compute(session.getState());
        return this.lastOffered.map((o) => o.choice);
    }

    async selectChoice(session: PlayableSession, choiceId: string): Promise<string> {
        const offered = this.lastOffered.find((o) => o.choice.id === choiceId);
        if (!offered) {
            return '';
        }

        const result = this.actionDispatcher.dispatch(session, offered.invocation);
        return this.narrator.narrate(session, offered.invocation, result);
    }
}
