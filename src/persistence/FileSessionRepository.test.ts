import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import { mkdtemp, rm, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { FileSessionRepository } from './FileSessionRepository';
import { InvalidGameDataError, InvalidSlotNameError } from './error';
import { GameState } from '../engine/state';
import { createGameState } from '../engine/state/GameState.test.utils';

// JSON drops `undefined`-valued keys (e.g. an unequipped weapon slot); this is the exact,
// functionally-lossless projection a file-backed save persists and restores.
const persisted = (state: GameState): GameState => JSON.parse(JSON.stringify(state)) as GameState;

describe(FileSessionRepository.name, () => {
    let baseDir: string;

    beforeEach(async () => {
        baseDir = await mkdtemp(join(tmpdir(), 'gunslinger-saves-'));
    });

    afterEach(async () => {
        await rm(baseDir, { recursive: true, force: true });
    });

    describe('save and load', () => {
        it('should round-trip a game state losslessly', async () => {
            const repository = new FileSessionRepository(baseDir);
            const state = createGameState((s) => {
                s.player.currentRoomId = 'room_2';
                s.turnCounter.count = 5;
                s.flags.visitedChapel = true;
            });

            await repository.save('slot', state);

            expect(await repository.load('slot')).to.deep.equal(persisted(state));
        });

        it('should create the base directory if it does not exist', async () => {
            const nested = join(baseDir, 'nested', 'saves');
            const repository = new FileSessionRepository(nested);

            await repository.save('slot', createGameState());

            expect(await repository.load('slot')).to.deep.equal(persisted(createGameState()));
        });

        it('should write human-readable JSON to <name>.json', async () => {
            const repository = new FileSessionRepository(baseDir);

            await repository.save('slot', createGameState());

            const raw = await readFile(join(baseDir, 'slot.json'), 'utf-8');
            expect(JSON.parse(raw)).to.deep.equal(persisted(createGameState()));
        });

        it('should overwrite an existing save for the same name', async () => {
            const repository = new FileSessionRepository(baseDir);
            await repository.save('slot', createGameState());

            await repository.save(
                'slot',
                createGameState((s) => {
                    s.player.name = 'Updated';
                }),
            );

            expect((await repository.load('slot'))!.player.name).to.equal('Updated');
        });
    });

    describe('load', () => {
        it('should return undefined for a name that was never saved', async () => {
            const repository = new FileSessionRepository(baseDir);

            expect(await repository.load('missing')).to.equal(undefined);
        });

        it('should throw InvalidGameDataError when the save file is not valid JSON', async () => {
            const repository = new FileSessionRepository(baseDir);
            await writeFile(join(baseDir, 'corrupt.json'), '{ not json', 'utf-8');

            let thrown: Error | undefined;
            await repository.load('corrupt').catch((e: Error) => (thrown = e));

            expect(thrown).to.be.instanceOf(InvalidGameDataError);
        });
    });

    describe('list', () => {
        it('should return an empty array when the base directory does not exist', async () => {
            const repository = new FileSessionRepository(join(baseDir, 'does-not-exist'));

            expect(await repository.list()).to.deep.equal([]);
        });

        it('should return the names of saved slots without the .json extension', async () => {
            const repository = new FileSessionRepository(baseDir);
            await repository.save('alpha', createGameState());
            await repository.save('beta', createGameState());

            expect((await repository.list()).sort()).to.deep.equal(['alpha', 'beta']);
        });

        it('should ignore non-json files in the directory', async () => {
            const repository = new FileSessionRepository(baseDir);
            await repository.save('alpha', createGameState());
            await writeFile(join(baseDir, 'notes.txt'), 'hello', 'utf-8');

            expect(await repository.list()).to.deep.equal(['alpha']);
        });
    });

    describe('slot-name safety', () => {
        for (const unsafe of ['../escape', 'with/slash', 'with space', '', 'dot.dot']) {
            it(`should reject the unsafe name ${JSON.stringify(unsafe)} on save`, async () => {
                const repository = new FileSessionRepository(baseDir);

                let thrown: Error | undefined;
                await repository.save(unsafe, createGameState()).catch((e: Error) => (thrown = e));

                expect(thrown, `expected save('${unsafe}') to reject`).to.be.instanceOf(InvalidSlotNameError);
            });
        }

        it('should reject an unsafe name on load', async () => {
            const repository = new FileSessionRepository(baseDir);

            let thrown: Error | undefined;
            await repository.load('../escape').catch((e: Error) => (thrown = e));

            expect(thrown).to.be.instanceOf(InvalidSlotNameError);
        });
    });
});
