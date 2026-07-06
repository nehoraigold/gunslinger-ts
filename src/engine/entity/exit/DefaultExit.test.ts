import { describe, it } from 'mocha';
import { expect } from 'chai';

import { DefaultExit } from './DefaultExit';
import { RoomStore, RootValueStore } from '../../store';
import { ExitState, RoomState } from '../../state';

describe(DefaultExit.name, () => {
    function createRoomStoreWithExits(exits: ExitState[]): RoomStore {
        return new RootValueStore<RoomState>({
            name: 'Room 1',
            description: 'description',
            lightLevel: 'bright',
            visited: false,
            exits,
            inventory: {},
            npcIds: [],
        });
    }

    describe('direction', () => {
        it('should expose the direction it was created with', () => {
            const store = createRoomStoreWithExits([{ direction: 'north', destinationRoomId: 'room_2' }]);
            const exit = new DefaultExit('north', store);

            expect(exit.direction).to.equal('north');
        });
    });

    describe('destinationRoomId', () => {
        it('should return the destination room id', () => {
            const store = createRoomStoreWithExits([{ direction: 'north', destinationRoomId: 'room_2' }]);
            const exit = new DefaultExit('north', store);

            expect(exit.destinationRoomId).to.equal('room_2');
        });
    });

    describe('isBlocked', () => {
        it('should return true if the exit has a locked lock', () => {
            const store = createRoomStoreWithExits([
                {
                    direction: 'north',
                    destinationRoomId: 'room_2',
                    lock: { keyItemId: 'iron_key', isLocked: true, consumesKey: false },
                },
            ]);
            const exit = new DefaultExit('north', store);

            expect(exit.isBlocked()).to.be.true;
        });

        it('should return false if the exit has an open lock', () => {
            const store = createRoomStoreWithExits([
                {
                    direction: 'north',
                    destinationRoomId: 'room_2',
                    lock: { keyItemId: 'iron_key', isLocked: false, consumesKey: false },
                },
            ]);
            const exit = new DefaultExit('north', store);

            expect(exit.isBlocked()).to.be.false;
        });

        it('should return false if the exit has no lock', () => {
            const store = createRoomStoreWithExits([{ direction: 'north', destinationRoomId: 'room_2' }]);
            const exit = new DefaultExit('north', store);

            expect(exit.isBlocked()).to.be.false;
        });
    });

    describe('blockReason', () => {
        it('should return door_locked if the exit is blocked by a locked lock', () => {
            const store = createRoomStoreWithExits([
                {
                    direction: 'north',
                    destinationRoomId: 'room_2',
                    lock: { keyItemId: 'iron_key', isLocked: true, consumesKey: false },
                },
            ]);
            const exit = new DefaultExit('north', store);

            expect(exit.blockReason()).to.equal('door_locked');
        });

        it('should return undefined if the exit is not blocked', () => {
            const store = createRoomStoreWithExits([{ direction: 'north', destinationRoomId: 'room_2' }]);
            const exit = new DefaultExit('north', store);

            expect(exit.blockReason()).to.equal(undefined);
        });
    });

    describe('lock', () => {
        it('should return undefined if the exit has no lock', () => {
            const store = createRoomStoreWithExits([{ direction: 'north', destinationRoomId: 'room_2' }]);
            const exit = new DefaultExit('north', store);

            expect(exit.lock()).to.equal(undefined);
        });

        it('should return a lock reflecting the exit lock state', () => {
            const store = createRoomStoreWithExits([
                {
                    direction: 'north',
                    destinationRoomId: 'room_2',
                    lock: { keyItemId: 'iron_key', isLocked: true, consumesKey: true },
                },
            ]);
            const exit = new DefaultExit('north', store);

            const lock = exit.lock();

            expect(lock?.keyItemId).to.equal('iron_key');
            expect(lock?.isLocked()).to.be.true;
            expect(lock?.consumesKey()).to.be.true;
        });

        it('should persist opening the lock back into the room store', () => {
            const store = createRoomStoreWithExits([
                {
                    direction: 'north',
                    destinationRoomId: 'room_2',
                    lock: { keyItemId: 'iron_key', isLocked: true, consumesKey: false },
                },
            ]);
            const exit = new DefaultExit('north', store);

            exit.lock()!.open();

            expect(exit.isBlocked()).to.be.false;
            expect(store.get().exits[0].lock?.isLocked).to.equal(false);
        });
    });
});
