import { describe, it } from 'mocha';
import { expect } from 'chai';

import { SaveController } from './SaveController';
import { RestorableSession } from '../../engine/session';
import { GameState } from '../../engine/state';
import { DeepReadonly } from '../../utils/types';
import {
    InMemorySessionRepository,
    InvalidSlotNameError,
    InvalidGameDataError,
    SessionRepository,
} from '../../persistence';
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
    describe('save', () => {
        it('should write the current state to the default slot', async () => {
            const repository = new InMemorySessionRepository();
            const controller = new SaveController(repository, new FakeSession(stateInRoom('room_1')));

            await controller.save();

            expect(await repository.load('autosave')).to.deep.equal(stateInRoom('room_1'));
        });

        it('should write to the slot set by setCurrentSlotName', async () => {
            const repository = new InMemorySessionRepository();
            const controller = new SaveController(repository, new FakeSession(stateInRoom('room_1')));

            controller.setCurrentSlotName('tavern');
            await controller.save();

            expect(controller.currentSlotName()).to.equal('tavern');
            expect(await repository.load('tavern')).to.deep.equal(stateInRoom('room_1'));
            expect(await repository.load('autosave')).to.equal(undefined);
        });
    });

    describe('setCurrentSlotName', () => {
        it('should throw InvalidSlotNameError and leave the current slot unchanged for an unsafe name', () => {
            const controller = new SaveController(
                new InMemorySessionRepository(),
                new FakeSession(stateInRoom('room_1')),
            );

            expect(() => controller.setCurrentSlotName('../escape')).to.throw(InvalidSlotNameError);
            expect(controller.currentSlotName()).to.equal('autosave');
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

        it('should make the loaded slot the current slot', async () => {
            const repository = new InMemorySessionRepository();
            await repository.save('checkpoint', stateInRoom('room_2'));
            const controller = new SaveController(repository, new FakeSession(stateInRoom('room_1')));

            await controller.load('checkpoint');

            expect(controller.currentSlotName()).to.equal('checkpoint');
        });

        it('should report not_found and leave the session untouched for an unknown slot', async () => {
            const session = new FakeSession(stateInRoom('room_1'));
            const controller = new SaveController(new InMemorySessionRepository(), session);

            const result = await controller.load('nope');

            expect(result).to.deep.equal({ status: 'not_found' });
            expect(session.getState().player.currentRoomId).to.equal('room_1');
        });

        it('should propagate a repository error and leave the session untouched', async () => {
            const failingRepository: SessionRepository = {
                load: async () => {
                    throw new InvalidGameDataError("Save 'x' is not valid JSON");
                },
                save: async () => undefined,
                list: async () => [],
            };
            const session = new FakeSession(stateInRoom('room_1'));
            const controller = new SaveController(failingRepository, session);

            let thrown: Error | undefined;
            await controller.load('x').catch((e: Error) => (thrown = e));

            expect(thrown).to.be.instanceOf(InvalidGameDataError);
            expect(session.getState().player.currentRoomId).to.equal('room_1');
        });
    });

    describe('list', () => {
        it('should report the saved slot names and the current slot', async () => {
            const repository = new InMemorySessionRepository();
            const controller = new SaveController(repository, new FakeSession(stateInRoom('room_1')));
            controller.setCurrentSlotName('one');
            await controller.save();
            controller.setCurrentSlotName('two');
            await controller.save();

            const listing = await controller.list();

            expect(listing.names.sort()).to.deep.equal(['one', 'two']);
            expect(listing.current).to.equal('two');
        });
    });
});
