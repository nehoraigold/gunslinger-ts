import { describe, it } from 'mocha';
import { expect } from 'chai';

import { SaveController } from './SaveController';
import { RestorableSession } from '../../engine/session';
import { GameState } from '../../engine/state';
import { DeepReadonly } from '../../utils/types';
import { InMemorySessionRepository, SessionRepository } from '../../persistence';
import { createGameState } from '../../engine/state/GameState.test.utils';

class FakeSession implements RestorableSession {
    constructor(private state: GameState) {}

    getState(): DeepReadonly<GameState> {
        return this.state;
    }

    restoreState(state: GameState): void {
        this.state = state;
    }
}

const stateInRoom = (roomId: string): GameState =>
    createGameState((s) => {
        s.player.currentRoomId = roomId;
    });

describe(SaveController.name, () => {
    describe('autosave', () => {
        it('should write the current state to the default slot', async () => {
            const repository = new InMemorySessionRepository();
            const controller = new SaveController(repository, new FakeSession(stateInRoom('room_1')));

            await controller.autosave();

            expect(await repository.load('autosave')).to.deep.equal(stateInRoom('room_1'));
        });
    });

    describe('save', () => {
        it('should write to the named slot and report it', async () => {
            const repository = new InMemorySessionRepository();
            const controller = new SaveController(repository, new FakeSession(stateInRoom('room_1')));

            const result = await controller.save('tavern');

            expect(result).to.deep.equal({ status: 'saved', name: 'tavern' });
            expect(await repository.load('tavern')).to.deep.equal(stateInRoom('room_1'));
        });

        it('should make the named slot the target of subsequent autosaves', async () => {
            const repository = new InMemorySessionRepository();
            const controller = new SaveController(repository, new FakeSession(stateInRoom('room_1')));

            await controller.save('tavern');
            await controller.autosave();

            expect((await repository.list()).sort()).to.deep.equal(['tavern']);
        });

        it('should write to the current slot when no name is given', async () => {
            const repository = new InMemorySessionRepository();
            const controller = new SaveController(repository, new FakeSession(stateInRoom('room_1')));

            const result = await controller.save();

            expect(result).to.deep.equal({ status: 'saved', name: 'autosave' });
            expect(await repository.load('autosave')).to.deep.equal(stateInRoom('room_1'));
        });

        it('should reject an invalid name without writing or changing the current slot', async () => {
            const repository = new InMemorySessionRepository();
            const controller = new SaveController(repository, new FakeSession(stateInRoom('room_1')));

            const result = await controller.save('../escape');

            expect(result).to.deep.equal({ status: 'invalid_name' });
            expect(await repository.list()).to.deep.equal([]);
            expect((await controller.list()).current).to.equal('autosave');
        });
    });

    describe('load', () => {
        it('should restore the saved state into the session and report the room', async () => {
            const repository = new InMemorySessionRepository();
            await repository.save('checkpoint', stateInRoom('room_2'));
            const session = new FakeSession(stateInRoom('room_1'));
            const controller = new SaveController(repository, session);

            const result = await controller.load('checkpoint');

            expect(result).to.deep.equal({ status: 'loaded', roomId: 'room_2' });
            expect(session.getState().player.currentRoomId).to.equal('room_2');
        });

        it('should make the loaded slot the target of subsequent autosaves', async () => {
            const repository = new InMemorySessionRepository();
            await repository.save('checkpoint', stateInRoom('room_2'));
            const controller = new SaveController(repository, new FakeSession(stateInRoom('room_1')));

            await controller.load('checkpoint');

            expect((await controller.list()).current).to.equal('checkpoint');
        });

        it('should report not_found and leave the session untouched for an unknown slot', async () => {
            const repository = new InMemorySessionRepository();
            const session = new FakeSession(stateInRoom('room_1'));
            const controller = new SaveController(repository, session);

            const result = await controller.load('nope');

            expect(result).to.deep.equal({ status: 'not_found' });
            expect(session.getState().player.currentRoomId).to.equal('room_1');
        });

        it('should report corrupt and leave the session untouched when the repository throws', async () => {
            const corruptRepository: SessionRepository = {
                load: async () => {
                    throw new Error("Save 'x' is not valid JSON: boom");
                },
                save: async () => undefined,
                list: async () => [],
            };
            const session = new FakeSession(stateInRoom('room_1'));
            const controller = new SaveController(corruptRepository, session);

            const result = await controller.load('x');

            expect(result.status).to.equal('corrupt');
            expect((result as { reason: string }).reason).to.match(/not valid json/i);
            expect(session.getState().player.currentRoomId).to.equal('room_1');
        });

        it('should reject an invalid name', async () => {
            const controller = new SaveController(
                new InMemorySessionRepository(),
                new FakeSession(stateInRoom('room_1')),
            );

            expect(await controller.load('../escape')).to.deep.equal({ status: 'invalid_name' });
        });
    });

    describe('list', () => {
        it('should report the saved slot names and the current slot', async () => {
            const repository = new InMemorySessionRepository();
            const controller = new SaveController(repository, new FakeSession(stateInRoom('room_1')));
            await controller.save('one');
            await controller.save('two');

            const listing = await controller.list();

            expect(listing.names.sort()).to.deep.equal(['one', 'two']);
            expect(listing.current).to.equal('two');
        });
    });
});
