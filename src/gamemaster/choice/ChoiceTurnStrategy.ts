import { TurnStrategy } from '../TurnStrategy';
import { PlayableSession } from '../../engine/session';
import { ActionDispatcher } from '../dispatch';
import { ChoiceProvider } from './provider/ChoiceProvider';
import { OutcomeNarrator } from '../OutcomeNarrator';

export class ChoiceTurnStrategy implements TurnStrategy {
    constructor(
        private readonly actionDispatcher: ActionDispatcher,
        private readonly choiceProvider: ChoiceProvider,
        private readonly narrator: OutcomeNarrator,
    ) {}

    async takeTurn(session: PlayableSession, choiceId: string): Promise<string> {
        const offered = this.choiceProvider.compute(session.getState()).find((o) => o.choice.id === choiceId);
        if (!offered) {
            return '';
        }

        const result = this.actionDispatcher.dispatch(session, offered.invocation);
        return this.narrator.narrate(session, offered.invocation, result);
    }
}
