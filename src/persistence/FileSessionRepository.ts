import { mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

import { SessionRepository } from './SessionRepository';
import { GameState } from '../engine/state';
import { DeepReadonly } from '../utils/types';

const SAFE_ID = /^[A-Za-z0-9_-]+$/;
const EXTENSION = '.json';

export class FileSessionRepository implements SessionRepository {
    constructor(private readonly baseDir: string) {}

    async load(sessionId: string): Promise<GameState | undefined> {
        const raw = await this.readRaw(sessionId);
        if (raw === undefined) {
            return undefined;
        }
        try {
            return JSON.parse(raw) as GameState;
        } catch (error) {
            throw new Error(`Save '${sessionId}' is not valid JSON: ${(error as Error).message}`);
        }
    }

    async save(sessionId: string, state: DeepReadonly<GameState>): Promise<void> {
        const path = this.pathFor(sessionId);
        await mkdir(this.baseDir, { recursive: true });
        await writeFile(path, JSON.stringify(state, null, 2), 'utf-8');
    }

    async list(): Promise<string[]> {
        let entries: string[];
        try {
            entries = await readdir(this.baseDir);
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                return [];
            }
            throw error;
        }
        return entries.filter((entry) => entry.endsWith(EXTENSION)).map((entry) => entry.slice(0, -EXTENSION.length));
    }

    private async readRaw(sessionId: string): Promise<string | undefined> {
        try {
            return await readFile(this.pathFor(sessionId), 'utf-8');
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                return undefined;
            }
            throw error;
        }
    }

    private pathFor(sessionId: string): string {
        if (!SAFE_ID.test(sessionId)) {
            throw new Error(`Invalid save name '${sessionId}': only letters, digits, '-' and '_' are allowed`);
        }
        return join(this.baseDir, `${sessionId}${EXTENSION}`);
    }
}
