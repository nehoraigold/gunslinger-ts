import { describe, it } from 'mocha';
import { expect } from 'chai';

import { DefaultRoom } from './DefaultRoom';
import { RoomStore } from '../../store';

describe(DefaultRoom.name, () => {
    describe('id', () => {
        it('should return the id of the room', () => {
            const room = new DefaultRoom('room_1', {} as RoomStore);

            expect(room.id).to.equal('room_1');
        });
    });
});
