import { describe, it } from 'mocha';
import { expect } from 'chai';

import { GameTransaction } from './GameTransaction';
import { createGameState } from '../state/GameState.test.utils';

describe(GameTransaction.name, () => {
    const initialState = createGameState();

    describe('constructor', () => {
        it('should not mutate the provided state when rooms or items are added or removed', () => {
            const state = createGameState();
            const roomIdsBefore = Object.keys(state.rooms);
            const itemIdsBefore = Object.keys(state.items);
            const tx = new GameTransaction(state);

            tx.rooms.add('room_3', { name: 'Room 3', description: 'The third room', exits: [] });
            tx.items.remove('item_1');

            expect(Object.keys(state.rooms)).to.deep.equal(roomIdsBefore);
            expect(Object.keys(state.items)).to.deep.equal(itemIdsBefore);
        });
    });

    describe('commit', () => {
        it('should return a copy of the initial game state', () => {
            const tx = new GameTransaction(initialState);

            const state = tx.commit();

            expect(state).to.deep.equal(initialState);
        });

        it('should reflect updates made during the transaction', () => {
            const tx = new GameTransaction(initialState);
            const room3 = {
                name: 'Room 3',
                description: 'The third room',
                exits: [],
            };

            tx.player.update((player) => (player.name = 'Ori'));
            tx.items.remove('item_1');
            tx.items.remove('item_2');
            tx.rooms.add('room_3', room3);

            const state = tx.commit();

            const expectedState = {
                player: {
                    ...initialState.player,
                    name: 'Ori',
                },
                items: {},
                rooms: {
                    ...initialState.rooms,
                    room_3: room3,
                },
            };
            expect(state).to.deep.equal(expectedState);
        });
    });
});
