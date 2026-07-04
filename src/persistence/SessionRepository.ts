import { GameState } from '../engine/state';
import { DeepReadonly } from '../utils/types';

export interface SessionRepository {
    load(sessionId: string): GameState | undefined;
    save(sessionId: string, state: DeepReadonly<GameState>): void;
}
