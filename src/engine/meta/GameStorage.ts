import { writeFile, readFile, mkdir, access, readdir, stat } from 'fs/promises';
import { join } from 'path';

import { GameState } from '../state/GameState';
import { getLogger } from '../../utils';

export interface SlotInfo {
    slotId: string;
    turnCount: number;
    savedAt: Date;
}

const log = getLogger('GameStorage');

export class GameStorage {
    constructor(private saveDir: string) {}

    public async save(slotId: string, state: GameState): Promise<void> {
        if (!(await this.isSaveDirExists())) {
            await this.makeSaveDir();
        }

        try {
            const filePath = join(this.saveDir, `${slotId}.json`);
            await writeFile(filePath, JSON.stringify(state, null, 2), 'utf8');
        } catch (error) {
            log.error(`Error saving game to ${slotId}: ${error}`);
        }
    }

    public async load(slotId: string): Promise<GameState | null> {
        if (!(await this.isSaveDirExists())) {
            return null;
        }

        try {
            const filePath = join(this.saveDir, `${slotId}.json`);
            const state = await readFile(filePath, 'utf8');
            return JSON.parse(state);
        } catch (error) {
            log.error(`Error loading game from ${slotId}: ${error}`);
            return null;
        }
    }

    public async listSaves(): Promise<string[]> {
        if (!(await this.isSaveDirExists())) {
            return [];
        }
        const files = await readdir(this.saveDir);
        return files.filter((f) => f.endsWith('.json')).map((f) => f.slice(0, -5));
    }

    public async listSavesWithMeta(): Promise<SlotInfo[]> {
        const slotIds = await this.listSaves();
        const results: SlotInfo[] = [];
        for (const slotId of slotIds) {
            try {
                const filePath = join(this.saveDir, `${slotId}.json`);
                const [fileStat, raw] = await Promise.all([stat(filePath), readFile(filePath, 'utf8')]);
                const state: GameState = JSON.parse(raw);
                results.push({ slotId, turnCount: state.turnCount, savedAt: fileStat.mtime });
            } catch {
                // Skip corrupted or unreadable saves.
            }
        }
        return results.sort((a, b) => b.savedAt.getTime() - a.savedAt.getTime());
    }

    private async makeSaveDir(): Promise<void> {
        await mkdir(this.saveDir);
    }

    private async isSaveDirExists(): Promise<boolean> {
        try {
            await access(this.saveDir);
            return true;
        } catch {
            return false;
        }
    }
}
