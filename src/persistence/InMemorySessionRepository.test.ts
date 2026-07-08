import { describe, it } from 'mocha';
import { expect } from 'chai';

import { InMemorySessionRepository } from './InMemorySessionRepository';
import { createGameState } from '../engine/state/GameState.test.utils';

describe(InMemorySessionRepository.name, () => {
    describe('load', () => {
        it('should return undefined for a session id that was never saved', async () => {
            const repository = new InMemorySessionRepository();

            expect(await repository.load('unknown_session')).to.equal(undefined);
        });

        it('should return the state previously saved under that session id', async () => {
            const repository = new InMemorySessionRepository();
            const state = createGameState();

            await repository.save('session_1', state);

            expect(await repository.load('session_1')).to.deep.equal(state);
        });

        it('should return a value that can be mutated without affecting the stored state', async () => {
            const repository = new InMemorySessionRepository();
            await repository.save('session_1', createGameState());

            const loaded = (await repository.load('session_1'))!;
            loaded.player.name = 'Mutated';

            expect((await repository.load('session_1'))!.player.name).to.not.equal('Mutated');
        });
    });

    describe('save', () => {
        it('should not be affected by later mutation of the state object passed in', async () => {
            const repository = new InMemorySessionRepository();
            const state = createGameState();

            await repository.save('session_1', state);
            state.player.name = 'Mutated after save';

            expect((await repository.load('session_1'))!.player.name).to.not.equal('Mutated after save');
        });

        it('should overwrite a previously saved state for the same session id', async () => {
            const repository = new InMemorySessionRepository();
            await repository.save('session_1', createGameState());

            const updated = createGameState((s) => {
                s.player.name = 'Updated';
            });
            await repository.save('session_1', updated);

            expect((await repository.load('session_1'))!.player.name).to.equal('Updated');
        });
    });

    describe('list', () => {
        it('should return an empty array when nothing has been saved', async () => {
            const repository = new InMemorySessionRepository();

            expect(await repository.list()).to.deep.equal([]);
        });

        it('should return the ids of all saved sessions', async () => {
            const repository = new InMemorySessionRepository();
            await repository.save('alpha', createGameState());
            await repository.save('beta', createGameState());

            expect((await repository.list()).sort()).to.deep.equal(['alpha', 'beta']);
        });

        it('should not list an id more than once after it is overwritten', async () => {
            const repository = new InMemorySessionRepository();
            await repository.save('alpha', createGameState());
            await repository.save('alpha', createGameState());

            expect(await repository.list()).to.deep.equal(['alpha']);
        });
    });
});
