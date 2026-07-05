import { describe, it } from 'mocha';
import { expect } from 'chai';

import { DefaultPlayer } from './DefaultPlayer';
import { RootValueStore } from '../../store';
import { PlayerState } from '../../state';
import { DefaultRoom } from '../room';

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
            inventory: {},
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
            const newRoom = new DefaultRoom(
                'room_1',
                new RootValueStore({ name: 'Room 1', description: 'description', exits: [], inventory: {} }),
            );

            player.moveTo(newRoom);

            expect(player.currentRoomId).to.equal(newRoom.id);
        });
    });

    describe('inventory', () => {
        it('should reflect the quantities held in player state', () => {
            const state: PlayerState = {
                id: 'player',
                name: 'Player',
                currentRoomId: 'room_1',
                equipment: { weapon: undefined, armor: undefined },
                inventory: { coins: 3 },
            };
            player = new DefaultPlayer(new RootValueStore(state));

            expect(player.inventory().quantityOf('coins')).to.equal(3);
        });

        it('should persist changes made through the returned inventory back into player state', () => {
            player.inventory().add('iron_key');

            expect(player.inventory().quantityOf('iron_key')).to.equal(1);
        });
    });
});
