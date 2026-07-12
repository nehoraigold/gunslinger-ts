import { PlayableSession } from '../engine/session';

export interface TurnStrategy {
    takeTurn(session: PlayableSession, rawInput: string): Promise<string>;
}
