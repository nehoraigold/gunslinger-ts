import { describe, it } from 'mocha';
import { expect } from 'chai';
import * as sinon from 'sinon';

import { EntityRepository } from './EntityRepository';
import { GameTransactionImpl } from '../../transaction';
import { createGameState } from '../../state/GameState.test.utils';

describe(EntityRepository.name, () => {
    const tx = new GameTransactionImpl(createGameState());
    const itemFactory = {
        create: sinon.stub().callsFake((id) => ({ id })),
    };
    const roomFactory = {
        create: sinon.stub().callsFake((id) => ({ id })),
    };
    const factories = { item: itemFactory, room: roomFactory };
    let repository: EntityRepository;

    beforeEach(() => {
        Object.values(factories).forEach((factory) => {
            factory.create.resetHistory();
        });
        repository = new EntityRepository(tx, factories);
    });

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
                expect(factories[entityName].create.calledTwice, 'create not called twice').to.be.true;
            });

            it(`should return the same ${entityName} instance when called multiple times`, () => {
                const firstEntity = repository[entityName](`${entityName}_1`);
                const secondEntity = repository[entityName](`${entityName}_1`);

                expect(firstEntity).not.to.be.undefined;
                expect(secondEntity).to.equal(firstEntity);
                expect(factories[entityName].create.calledOnce).to.be.true;
            });
        });
    });
});
