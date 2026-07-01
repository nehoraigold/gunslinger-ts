import { describe, it } from 'mocha';
import { expect } from 'chai';

import { EntityRepository } from './EntityRepository';
import { GameTransactionImpl } from '../../transaction';
import { createGameState } from '../../state/GameState.test.utils';

describe(EntityRepository.name, () => {
    const tx = new GameTransactionImpl(createGameState());
    const repository = new EntityRepository(tx);

    describe('player', () => {
        it('should return an identical player instance when called multiple times', () => {
            const player1 = repository.player();
            const player2 = repository.player();

            expect(player1).to.equal(player2);
        });
    });

    const entities = ['room', 'item'] as const;

    entities.forEach((entityName) => {
        describe(entityName, () => {
            it(`should return undefined if the ${entityName} does not exist`, () => {
                const undefinedEntity = repository.room(`nonexistent_${entityName}`);

                expect(undefinedEntity).to.be.undefined;
            });

            it(`should not be undefined if the ${entityName} exists`, () => {
                const entity = repository[entityName](`${entityName}_1`);

                expect(entity).not.to.be.undefined;
            });

            it(`should return different ${entityName} instances for different ids`, () => {
                const entity1 = repository[entityName](`${entityName}_1`);
                const entity2 = repository[entityName](`${entityName}_2`);

                expect(entity1).not.to.equal(entity2);
            });

            it(`should return the same ${entityName} instance when called multiple times`, () => {
                const firstEntity = repository[entityName](`${entityName}_1`);
                const secondEntity = repository[entityName](`${entityName}_1`);

                expect(firstEntity).not.to.be.undefined;
                expect(secondEntity).to.equal(firstEntity);
            });
        });
    });

    describe('item', () => {
        it('should return undefined if the item does not exist', () => {
            const undefinedRoom = repository.room('nonexistent_item');

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
