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
            exits,
        });
    }

    describe('destinationRoomId', () => {
        it('should return the destination room id', () => {
            const exitState: ExitState = { direction: 'north', destinationRoomId: 'room_2' };
            const exit = new DefaultExit(exitState, createRoomStoreWithExits([exitState]));

            const destinationRoomId = exit.destinationRoomId;

            expect(destinationRoomId).to.equal('room_2');
        });
    });

    describe('isBlocked', () => {
        it('should return true if the exit state is blocked', () => {
            const exitState: ExitState = {
                direction: 'north',
                destinationRoomId: 'room_2',
                isBlocked: true,
                blockReason: 'door_locked',
            };
            const exit = new DefaultExit(exitState, createRoomStoreWithExits([exitState]));

            expect(exit.isBlocked()).to.be.true;
        });

        it('should return false if the exit state is explicitly not blocked', () => {
            const exitState: ExitState = { direction: 'north', destinationRoomId: 'room_2', isBlocked: false };
            const exit = new DefaultExit(exitState, createRoomStoreWithExits([exitState]));

            expect(exit.isBlocked()).to.be.false;
        });

        it('should return false if the exit state does not specify isBlocked', () => {
            const exitState: ExitState = { direction: 'north', destinationRoomId: 'room_2' };
            const exit = new DefaultExit(exitState, createRoomStoreWithExits([exitState]));

            expect(exit.isBlocked()).to.be.false;
        });
    });
});
