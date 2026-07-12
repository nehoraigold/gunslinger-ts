import { PlayableSession } from '../engine/session';
import { TurnOutput } from './TurnOutput';

export interface ChoiceResolver {
    selectChoice(session: PlayableSession, choiceId: string): Promise<TurnOutput>;
}
