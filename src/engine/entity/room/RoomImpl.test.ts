import { describe, it } from 'mocha';
import { expect } from 'chai';

import { RoomImpl } from './RoomImpl';
import { RoomStore } from '../../store';

describe(RoomImpl.name, () => {
    describe('id', () => {
        it('should return the id of the room', () => {
            const room = new RoomImpl('room_1', {} as RoomStore);

            expect(room.id).to.equal('room_1');
        });
    });
});
