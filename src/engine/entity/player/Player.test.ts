import { describe, it } from 'mocha';
import { expect } from 'chai';

import { DefaultPlayer } from './DefaultPlayer';
import { RootValueStore } from '../../store';
import { PlayerState } from '../../state';
import { createMockRoom } from '../room/MockRoom';

describe(DefaultPlayer.name, () => {
    let player: DefaultPlayer;

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

        const store = new RootValueStore(state);
        player = new DefaultPlayer(store);
    });

    describe('currentRoomId', () => {
        it('should return the current room id', () => {
            const roomId = player.currentRoomId;

            expect(roomId).to.equal('room_1');
        });
    });

    describe('moveTo', () => {
        it('should change the current room id', () => {
            const newRoom = createMockRoom({ id: 'room_2' });

            player.moveTo(newRoom);

            expect(player.currentRoomId).to.equal(newRoom.id);
        });
    });
});
