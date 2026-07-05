import { describe, it } from 'mocha';
import { expect } from 'chai';

import { DefaultRoomFactory } from './DefaultRoomFactory';
import { DefaultRoom } from './DefaultRoom';
import { RootValueStore } from '../../store';
import { RoomState } from '../../state';

describe(DefaultRoomFactory.name, () => {
    describe('create', () => {
        it('should create a DefaultRoom with the given id and store', () => {
            const store = new RootValueStore<RoomState>({
                name: 'Room 1',
                description: 'description',
                exits: [],
                inventory: {},
            });
            const factory = new DefaultRoomFactory();

            const room = factory.create('room_1', store);

            expect(room).to.be.instanceOf(DefaultRoom);
            expect(room.id).to.equal('room_1');
        });
    });
});
