import { describe, it } from 'mocha';
import { expect } from 'chai';

import { DefaultWorldSnapshotBuilder } from './DefaultWorldSnapshotBuilder';
import { createGameState } from '../../../engine/state/GameState.test.utils';

describe(DefaultWorldSnapshotBuilder.name, () => {
    const builder = new DefaultWorldSnapshotBuilder();

    describe('build', () => {
        it("should include the current room's name and description", () => {
            const state = createGameState();

            const snapshot = builder.build(state);

            expect(snapshot).to.include('Room 1');
            expect(snapshot).to.include('The first room');
        });

        it('should list each unblocked exit by direction only', () => {
            const state = createGameState();

            const snapshot = builder.build(state);

            expect(snapshot).to.match(/west(?!.*blocked)/);
        });

        it('should note the block reason for a blocked exit', () => {
            const state = createGameState((s) => {
                s.rooms.room_1.exits = [
                    { direction: 'west', destinationRoomId: 'room_2', isBlocked: true, blockReason: 'door_locked' },
                ];
            });

            const snapshot = builder.build(state);

            expect(snapshot).to.match(/west.*blocked.*door_locked/);
        });

        it('should report no exits when the room has none', () => {
            const state = createGameState((s) => {
                s.rooms.room_1.exits = [];
            });

            const snapshot = builder.build(state);

            expect(snapshot).to.include('none');
        });

        it('should show both equipment slots as none when nothing is equipped', () => {
            const state = createGameState();

            const snapshot = builder.build(state);

            expect(snapshot).to.match(/weapon: none/);
            expect(snapshot).to.match(/armor: none/);
        });

        it("should show the equipped item's name when a slot is filled", () => {
            const state = createGameState((s) => {
                s.player.equipment.weapon = 'item_1';
            });

            const snapshot = builder.build(state);

            expect(snapshot).to.match(/weapon: Item 1/);
        });
    });
});
