import { describe, it } from 'mocha';
import { expect } from 'chai';

import { PlayerImpl } from './PlayerImpl';
import { ValueStoreImpl } from '../../store';
import { PlayerState } from '../../state/player';
import { Room, RoomImpl } from '../room';

describe(PlayerImpl.name, () => {
    let player: PlayerImpl;

    beforeEach(() => {
        const state: PlayerState = {
            id: 'player',
            name: 'Player',
            currentRoomId: 'room_1',
            equipment: {
                weapon: undefined,
                armor: undefined,
            },
        };

        const store = new ValueStoreImpl(state);
        player = new PlayerImpl(store);
    });

    describe('currentRoomId', () => {
        it('should return the current room id', () => {
            const roomId = player.currentRoomId;

            expect(roomId).to.equal('room_1');
        });
    });

    describe('moveTo', () => {
        it('should change the current room id', () => {
            const newRoom: Room = {
                id: 'room_2',
            };

            player.moveTo(newRoom);

            expect(player.currentRoomId).to.equal(newRoom.id);
        });
    });
});
