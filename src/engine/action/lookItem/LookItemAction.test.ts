import { describe, it } from 'mocha';
import { expect } from 'chai';

import { LookItemAction } from './LookItemAction';
import { Context, GameContext } from '../../context';
import { GameTransaction } from '../../transaction';
import { createGameState, ModifyState } from '../../state/GameState.test.utils';
import { DefaultRoomFactory, DefaultItemFactory } from '../../entity';
import { GameState } from '../../state';
import { ItemNotFoundError } from '../../error';

describe(LookItemAction.name, () => {
    function createDefaultContext(modifyState?: ModifyState): Context {
        const state = createGameState(modifyState);
        return new GameContext(new GameTransaction(state), {
            room: new DefaultRoomFactory(),
            item: new DefaultItemFactory(),
        });
    }

    function withItemCarried(itemId: string, quantity: number): (state: GameState) => void {
        return (state) => {
            state.player.inventory[itemId] = quantity;
        };
    }

    function withItemInRoom(itemId: string, quantity: number): (state: GameState) => void {
        return (state) => {
            state.rooms.room_1.inventory[itemId] = quantity;
        };
    }

    describe('execute', () => {
        it('should describe an item carried in the inventory', () => {
            const ctx = createDefaultContext(withItemCarried('item_1', 2));

            const outcome = new LookItemAction().execute(ctx, { itemId: 'item_1' });

            expect(outcome).to.deep.equal({
                result: 'success',
                data: {
                    itemId: 'item_1',
                    name: 'Item 1',
                    description: 'The first item',
                    type: 'weapon',
                    location: 'inventory',
                    quantity: 2,
                },
            });
        });

        it('should describe an item lying in the current room', () => {
            const ctx = createDefaultContext(withItemInRoom('item_2', 3));

            const outcome = new LookItemAction().execute(ctx, { itemId: 'item_2' });

            expect(outcome).to.deep.equal({
                result: 'success',
                data: {
                    itemId: 'item_2',
                    name: 'Item 2',
                    description: 'The second item',
                    type: 'consumable',
                    location: 'room',
                    quantity: 3,
                },
            });
        });

        it('should prefer the inventory when the item is both carried and on the ground', () => {
            const ctx = createDefaultContext((state) => {
                withItemCarried('item_1', 1)(state);
                withItemInRoom('item_1', 4)(state);
            });

            const outcome = new LookItemAction().execute(ctx, { itemId: 'item_1' });

            expect(outcome.result === 'success' && outcome.data.location).to.equal('inventory');
            expect(outcome.result === 'success' && outcome.data.quantity).to.equal(1);
        });

        it('should fail with item_not_present when a known item is in neither place', () => {
            const ctx = createDefaultContext();

            const outcome = new LookItemAction().execute(ctx, { itemId: 'item_1' });

            expect(outcome).to.deep.include({ result: 'failure', reason: 'item_not_present' });
        });

        it('should fail with item_not_present for an id that is not in reach, even with no definition', () => {
            const ctx = createDefaultContext();

            const outcome = new LookItemAction().execute(ctx, { itemId: 'nonexistent_item' });

            expect(outcome).to.deep.include({ result: 'failure', reason: 'item_not_present' });
        });

        it('should throw an ItemNotFoundError when an in-reach item has no definition', () => {
            const ctx = createDefaultContext(withItemCarried('nonexistent_item', 1));

            const look = () => new LookItemAction().execute(ctx, { itemId: 'nonexistent_item' });

            expect(look).to.throw(ItemNotFoundError, /nonexistent_item/);
        });
    });

    describe('schema', () => {
        it('should reject input missing an itemId', () => {
            expect(() => new LookItemAction().schema.parse({})).to.throw();
        });

        it('should accept an itemId', () => {
            expect(() => new LookItemAction().schema.parse({ itemId: 'item_1' })).to.not.throw();
        });
    });
});
