import { describe, it } from 'mocha';
import { expect } from 'chai';

import { DefaultRoom } from './DefaultRoom';
import { RootValueStore } from '../../store';
import { RoomState } from '../../state';

describe(DefaultRoom.name, () => {
    function createDefaultRoom(state?: Partial<RoomState>): DefaultRoom {
        const roomStore = new RootValueStore({
            name: 'room_1',
            description: 'description',
            exits: [],
            inventory: {},
            ...state,
        });
        return new DefaultRoom('room_1', roomStore);
    }

    describe('id', () => {
        it('should return the id of the room', () => {
            const room = createDefaultRoom();

            expect(room.id).to.equal('room_1');
        });
    });

    describe('getExit', () => {
        it('should return an exit corresponding to that direction', () => {
            const room = createDefaultRoom({ exits: [{ direction: 'north', destinationRoomId: 'room_2' }] });

            const exit = room.getExit('north');

            expect(exit).not.to.be.undefined;
        });

        it('should return undefined if no exit exists in that direction', () => {
            const room = createDefaultRoom();

            const exit = room.getExit('south');

            expect(exit).to.be.undefined;
        });
    });

    describe('inventory', () => {
        it('should reflect the quantities held in room state', () => {
            const room = createDefaultRoom({ inventory: { iron_key: 1 } });

            expect(room.inventory().quantityOf('iron_key')).to.equal(1);
        });

        it('should persist changes made through the returned inventory back into room state', () => {
            const room = createDefaultRoom();

            room.inventory().add('coins', 5);

            expect(room.inventory().quantityOf('coins')).to.equal(5);
        });
    });
});
