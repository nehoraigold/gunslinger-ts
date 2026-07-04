import { describe, it } from 'mocha';
import { expect } from 'chai';

import { InMemorySessionRepository } from './InMemorySessionRepository';
import { createGameState } from '../engine/state/GameState.test.utils';

describe(InMemorySessionRepository.name, () => {
    describe('load', () => {
        it('should return undefined for a session id that was never saved', () => {
            const repository = new InMemorySessionRepository();

            expect(repository.load('unknown_session')).to.equal(undefined);
        });

        it('should return the state previously saved under that session id', () => {
            const repository = new InMemorySessionRepository();
            const state = createGameState();

            repository.save('session_1', state);

            expect(repository.load('session_1')).to.deep.equal(state);
        });

        it('should return a value that can be mutated without affecting the stored state', () => {
            const repository = new InMemorySessionRepository();
            repository.save('session_1', createGameState());

            const loaded = repository.load('session_1')!;
            loaded.player.name = 'Mutated';

            expect(repository.load('session_1')!.player.name).to.not.equal('Mutated');
        });
    });

    describe('save', () => {
        it('should not be affected by later mutation of the state object passed in', () => {
            const repository = new InMemorySessionRepository();
            const state = createGameState();

            repository.save('session_1', state);
            state.player.name = 'Mutated after save';

            expect(repository.load('session_1')!.player.name).to.not.equal('Mutated after save');
        });

        it('should overwrite a previously saved state for the same session id', () => {
            const repository = new InMemorySessionRepository();
            repository.save('session_1', createGameState());

            const updated = createGameState((s) => {
                s.player.name = 'Updated';
            });
            repository.save('session_1', updated);

            expect(repository.load('session_1')!.player.name).to.equal('Updated');
        });
    });
});
