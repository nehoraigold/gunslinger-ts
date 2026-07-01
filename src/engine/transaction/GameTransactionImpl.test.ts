import { describe, it } from 'mocha';
import { expect } from 'chai';

import { GameTransactionImpl } from './GameTransactionImpl';
import { createGameState } from '../state/GameState.test.utils';

describe(GameTransactionImpl.name, () => {
    const initialState = createGameState();

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
