import { PlayableSession } from '../engine/session';
import { TurnOutput } from './TurnOutput';

export interface TurnStrategy {
    takeTurn(session: PlayableSession, rawInput: string): Promise<TurnOutput>;
}
