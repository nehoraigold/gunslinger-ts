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
            money: 0,
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
                new RootValueStore({
                    name: 'Room 1',
                    description: 'description',
                    lightLevel: 'bright',
                    visited: false,
                    exits: [],
                    inventory: {},
                    npcIds: [],
                }),
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
                money: 0,
            };
            player = new DefaultPlayer(new RootValueStore(state));

            expect(player.inventory().quantityOf('coins')).to.equal(3);
        });

        it('should persist changes made through the returned inventory back into player state', () => {
            player.inventory().add('iron_key');

            expect(player.inventory().quantityOf('iron_key')).to.equal(1);
        });
    });

    describe('equipment', () => {
        it('should reflect the slots held in player state', () => {
            const state: PlayerState = {
                id: 'player',
                name: 'Player',
                currentRoomId: 'room_1',
                equipment: { weapon: 'rusty_revolver', armor: undefined },
                inventory: {},
                money: 0,
            };
            player = new DefaultPlayer(new RootValueStore(state));

            expect(player.equipment().equippedIn('weapon')).to.equal('rusty_revolver');
            expect(player.equipment().equippedIn('armor')).to.be.undefined;
        });

        it('should persist changes made through the returned equipment back into player state', () => {
            player.equipment().equip('armor', 'leather_duster');

            expect(player.equipment().equippedIn('armor')).to.equal('leather_duster');
        });
    });

    describe('wallet', () => {
        it('should reflect the money held in player state', () => {
            const state: PlayerState = {
                id: 'player',
                name: 'Player',
                currentRoomId: 'room_1',
                equipment: { weapon: undefined, armor: undefined },
                inventory: {},
                money: 42,
            };
            player = new DefaultPlayer(new RootValueStore(state));

            expect(player.wallet().balance()).to.equal(42);
        });

        it('should persist changes made through the returned wallet back into player state', () => {
            player.wallet().credit(10);

            expect(player.wallet().balance()).to.equal(10);
        });
    });
});
