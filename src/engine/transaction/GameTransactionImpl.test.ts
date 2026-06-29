import { describe, it } from 'mocha';
import { expect } from 'chai';

import { GameTransactionImpl } from './GameTransactionImpl';

import { GameState } from '../state/GameState';
import { PlayerState } from '../state/player';
import { ItemState } from '../state/item';
import { RoomState } from '../state/room';

describe(GameTransactionImpl.name, () => {
    const player: PlayerState = {
        id: 'player',
        name: 'Roland',
        currentRoomId: '',
        equipment: {
            weapon: undefined,
            armor: undefined,
        },
    };

    const sword: ItemState = {
        name: 'Sword',
        description: 'A normal sword',
        type: 'weapon',
    };

    const room1: RoomState = {
        name: 'Room 1',
        description: 'The first room',
        exits: [
            {
                direction: 'west',
                destinationRoomId: 'room_2',
            },
        ],
    };

    const room2: RoomState = {
        name: 'Room 2',
        description: 'The second room',
        exits: [
            {
                direction: 'east',
                destinationRoomId: 'room_1',
            },
        ],
    };

    const initialState: GameState = {
        player,
        items: {
            sword_1: sword,
        },
        rooms: {
            room_1: room1,
            room_2: room2,
        },
    };

    describe('constructor', () => {
        it('should initialize stores from the initial game state', () => {
            const tx = new GameTransactionImpl(initialState);

            expect(tx.player.get()).to.deep.equal(player);
            expect(tx.rooms.get('room_1')).to.deep.equal(room1);
            expect(tx.rooms.get('room_2')).to.deep.equal(room2);
            expect(tx.items.get('sword_1')).to.deep.equal(sword);
        });
    });

    describe('commit', () => {
        it('should return a copy of the initial game state', () => {
            const tx = new GameTransactionImpl(initialState);

            const state = tx.commit();

            expect(state).to.deep.equal(initialState);
        });

        it('should reflect updates made during the transaction', () => {
            const tx = new GameTransactionImpl(initialState);
            const room3 = {
                name: 'Room 3',
                description: 'The third room',
                exits: [],
            };

            tx.player.update((player) => (player.name = 'Ori'));
            tx.items.remove('sword_1');
            tx.rooms.add('room_3', room3);

            const state = tx.commit();

            expect(state.player.name).to.equal('Ori');
            expect(state.rooms.room_3).to.deep.equal(room3);
            expect(state.items.sword_1).to.be.undefined;
        });
    });
});
