import { mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

import { SessionRepository } from './SessionRepository';
import { GameState } from '../engine/state';
import { DeepReadonly } from '../utils/types';
import { getLogger } from '../utils/logger';
import { InvalidGameDataError } from './error/InvalidGameDataError';
import { InvalidSlotNameError } from './error/InvalidSlotNameError';

const SAFE_ID = /^[A-Za-z0-9_-]+$/;
const EXTENSION = '.json';

const log = getLogger('persistence.file');

export class FileSessionRepository implements SessionRepository {
    constructor(private readonly baseDir: string) {}

    async load(sessionId: string): Promise<GameState | undefined> {
        const raw = await this.readRaw(sessionId);
        if (raw === undefined) {
            log.debug('load miss', { sessionId });
            return undefined;
        }
        try {
            const state = JSON.parse(raw) as GameState;
            log.debug('load hit', { sessionId });
            return state;
        } catch (error) {
            log.error('save data is not valid JSON', { sessionId, message: this.messageFor(error) });
            throw new InvalidGameDataError(`Save '${sessionId}' is not valid JSON`, error);
        }
    }

    async save(sessionId: string, state: DeepReadonly<GameState>): Promise<void> {
        const path = this.pathFor(sessionId);
        await mkdir(this.baseDir, { recursive: true });
        await writeFile(path, JSON.stringify(state, null, 2), 'utf-8');
        log.debug('saved', { sessionId, path });
    }

    async list(): Promise<string[]> {
        let entries: string[];
        try {
            entries = await readdir(this.baseDir);
        } catch (error) {
            return this.returnIfNoEntryError(error, []);
        }
        return entries.filter((entry) => entry.endsWith(EXTENSION)).map((entry) => entry.slice(0, -EXTENSION.length));
    }

    private async readRaw(sessionId: string): Promise<string | undefined> {
        try {
            return await readFile(this.pathFor(sessionId), 'utf-8');
        } catch (error) {
            return this.returnIfNoEntryError(error, undefined);
        }
    }

    private messageFor(error: unknown): string {
        return error instanceof Error ? error.message : String(error);
    }

    private pathFor(sessionId: string): string {
        if (!SAFE_ID.test(sessionId)) {
            throw new InvalidSlotNameError(sessionId, `only letters, digits, '-' and '_' are allowed`);
        }
        return join(this.baseDir, `${sessionId}${EXTENSION}`);
    }

    private returnIfNoEntryError<T>(error: unknown, defaultValue: T) {
        if (this.isNoEntryError(error)) {
            return defaultValue;
        }
        throw error;
    }

    private isNoEntryError(error: unknown): error is NodeJS.ErrnoException {
        return !!error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT';
    }
}
