import { describe, it } from 'mocha';
import { expect } from 'chai';
import * as sinon from 'sinon';

import { GameContext } from './GameContext';
import { GameTransaction } from '../transaction';
import { createGameState } from '../state/GameState.test.utils';
import { ItemNotFoundError, NpcNotFoundError, RoomNotFoundError } from '../error';

describe(GameContext.name, () => {
    const tx = new GameTransaction(createGameState());
    const itemFactory = {
        create: sinon.stub().callsFake((id) => ({ id })),
    };
    const roomFactory = {
        create: sinon.stub().callsFake((id) => ({ id })),
    };
    const npcFactory = {
        create: sinon.stub().callsFake((id) => ({ id })),
    };
    const factories = { item: itemFactory, room: roomFactory, npc: npcFactory };
    let repository: GameContext;

    beforeEach(() => {
        Object.values(factories).forEach((factory) => {
            factory.create.resetHistory();
        });
        repository = new GameContext(tx, factories);
    });

    describe('player', () => {
        it('should return an identical player instance when called multiple times', () => {
            const player1 = repository.player();
            const player2 = repository.player();

            expect(player1).to.equal(player2);
        });
    });

    describe('flags', () => {
        it('should return an identical flags instance when called multiple times', () => {
            expect(repository.flags()).to.equal(repository.flags());
        });

        it('should read and write flags through the underlying transaction', () => {
            const freshTx = new GameTransaction(createGameState());
            const context = new GameContext(freshTx, factories);

            context.flags().set('gate_open', true);

            expect(context.flags().get('gate_open')).to.equal(true);
            expect(freshTx.commit().flags).to.deep.equal({ gate_open: true });
        });
    });

    const entities = ['room', 'item', 'npc'] as const;

    entities.forEach((entityName) => {
        describe(entityName, () => {
            it(`should return undefined if the ${entityName} does not exist`, () => {
                const undefinedEntity = repository[entityName](`nonexistent_${entityName}`);

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

    const requireEntities = [
        { name: 'room', method: 'requireRoom', error: RoomNotFoundError },
        { name: 'item', method: 'requireItem', error: ItemNotFoundError },
        { name: 'npc', method: 'requireNpc', error: NpcNotFoundError },
    ] as const;

    requireEntities.forEach(({ name, method, error }) => {
        describe(method, () => {
            it(`should return the ${name} when it exists`, () => {
                const entity = repository[method](`${name}_1`);

                expect(entity).to.equal(repository[name](`${name}_1`));
            });

            it(`should throw ${error.name} when the ${name} does not exist`, () => {
                const require = () => repository[method](`nonexistent_${name}`);

                expect(require).to.throw(error, /nonexistent_/);
            });
        });
    });

    describe('requireCurrentRoom', () => {
        it("should return the room matching the player's current room id", () => {
            const room = repository.requireCurrentRoom();

            expect(room).to.equal(repository.room('room_1'));
        });

        it("should throw a RoomNotFoundError if the player's current room does not exist", () => {
            const brokenTx = new GameTransaction(
                createGameState((state) => {
                    state.player.currentRoomId = 'nonexistent_room';
                }),
            );
            const brokenRepository = new GameContext(brokenTx, factories);

            const requireCurrentRoom = () => brokenRepository.requireCurrentRoom();

            expect(requireCurrentRoom).to.throw(RoomNotFoundError, /nonexistent_room/);
        });
    });
});
