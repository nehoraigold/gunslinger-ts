import { SessionRepository } from './SessionRepository';
import { GameState } from '../engine/state';
import { DeepReadonly, cloneMutable } from '../utils/types';

export class InMemorySessionRepository implements SessionRepository {
    private readonly sessions = new Map<string, GameState>();

    async load(sessionId: string): Promise<GameState | undefined> {
        const state = this.sessions.get(sessionId);
        return state ? cloneMutable(state) : undefined;
    }

    async save(sessionId: string, state: DeepReadonly<GameState>): Promise<void> {
        this.sessions.set(sessionId, cloneMutable<GameState>(state));
    }

    async list(): Promise<string[]> {
        return [...this.sessions.keys()];
    }
}
