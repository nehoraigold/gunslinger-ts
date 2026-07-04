import { SessionRepository } from './SessionRepository';
import { GameState } from '../engine/state';
import { DeepReadonly, cloneMutable } from '../utils/types';

export class InMemorySessionRepository implements SessionRepository {
    private readonly sessions = new Map<string, GameState>();

    load(sessionId: string): GameState | undefined {
        const state = this.sessions.get(sessionId);
        return state ? cloneMutable(state) : undefined;
    }

    save(sessionId: string, state: DeepReadonly<GameState>): void {
        this.sessions.set(sessionId, cloneMutable<GameState>(state));
    }
}
