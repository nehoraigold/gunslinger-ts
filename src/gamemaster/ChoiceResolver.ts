import { PlayableSession } from '../engine/session';
import { AvailableChoice } from './choice';

export interface ChoiceResolver {
    refreshChoices(session: PlayableSession): AvailableChoice[];
    selectChoice(session: PlayableSession, choiceId: string): Promise<string>;
}
