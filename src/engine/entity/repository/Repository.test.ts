import { describe, it } from 'mocha';
import { expect } from 'chai';

import { RepositoryImpl } from './RepositoryImpl';
import { GameTransactionImpl } from '../../transaction';
import { createGameState } from '../../state/GameState.test.utils';

describe('Repository', () => {
    const tx = new GameTransactionImpl(createGameState());
    const repository = new RepositoryImpl(tx);

    describe('player', () => {
        it('should return an identical player instance when called multiple times', () => {
            const player1 = repository.player();
            const player2 = repository.player();

            expect(player1).to.equal(player2);
        });
    });

    describe('room', () => {
        it('should return undefined if the room does not exist', () => {
            const undefinedRoom = repository.room('nonexistent_room');

            expect(undefinedRoom).to.be.undefined;
        });

        it('should not be undefined if the room exists', () => {
            const room = repository.room('room_1');

            expect(room).not.to.be.undefined;
        });

        it('should return different room instances for different ids', () => {
            const room1 = repository.room('room_1');
            const room2 = repository.room('room_2');

            expect(room1).not.to.equal(room2);
        });

        it('should return the same room instance when called multiple times', () => {
            const firstRoom1 = repository.room('room_1');
            const secondRoom1 = repository.room('room_1');

            expect(firstRoom1).not.to.be.undefined;
            expect(firstRoom1).to.equal(secondRoom1);
        });
    });
});
