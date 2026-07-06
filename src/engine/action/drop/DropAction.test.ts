import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { DropAction } from './DropAction';
import { Context, GameContext } from '../../context';
import { fakeContext, fakePlayer, fakeRoom } from '../../context/Context.test.utils';
import { GameTransaction } from '../../transaction';
import { createGameState, ModifyState } from '../../state/GameState.test.utils';
import { DefaultRoomFactory, DefaultItemFactory, DefaultNpcFactory } from '../../entity';
import { GameState } from '../../state';
import { TransferOutcome } from '../../service/inventory/TransferOutcome';

describe(DropAction.name, () => {
    function createFakeContext(): Context {
        return fakeContext({ player: () => fakePlayer(), requireCurrentRoom: () => fakeRoom() });
    }

    describe('execute', () => {
        describe('wired to the real InventoryService', () => {
            function createDefaultContext(modifyState?: ModifyState): Context {
                const state = createGameState(modifyState);
                return new GameContext(new GameTransaction(state), {
                    room: new DefaultRoomFactory(),
                    item: new DefaultItemFactory(),
                    npc: new DefaultNpcFactory(),
                });
            }

            function withItemInInventory(itemId: string): (state: GameState) => void {
                return (state) => {
                    state.player.inventory[itemId] = 1;
                };
            }

            it('should drop the item and return a success outcome with the item id', () => {
                const ctx = createDefaultContext(withItemInInventory('item_1'));
                const action = new DropAction();

                const outcome = action.execute(ctx, { itemId: 'item_1' });

                expect(outcome).to.deep.equal({ result: 'success', data: { itemId: 'item_1' } });
                expect(ctx.player().inventory().quantityOf('item_1')).to.equal(0);
            });
        });

        describe('with a fake InventoryService', () => {
            function createActionWithFakeInventory(outcome: TransferOutcome) {
                return new DropAction(() => ({ transfer: sinon.stub().returns(outcome) }));
            }

            it('should translate a "transferred" outcome into a success outcome', () => {
                const action = createActionWithFakeInventory({ type: 'transferred', itemId: 'item_1', quantity: 1 });

                const outcome = action.execute(createFakeContext(), { itemId: 'item_1' });

                expect(outcome).to.deep.equal({ result: 'success', data: { itemId: 'item_1' } });
            });

            it('should translate a "notAvailable" outcome into a "not_in_inventory" failure', () => {
                const action = createActionWithFakeInventory({ type: 'notAvailable' });

                const outcome = action.execute(createFakeContext(), { itemId: 'item_1' });

                expect(outcome).to.deep.include({ result: 'failure', reason: 'not_in_inventory' });
            });

            it('should translate an "insufficientQuantity" outcome into a "not_enough_in_inventory" failure', () => {
                const action = createActionWithFakeInventory({ type: 'insufficientQuantity' });

                const outcome = action.execute(createFakeContext(), { itemId: 'item_1' });

                expect(outcome).to.deep.include({ result: 'failure', reason: 'not_enough_in_inventory' });
            });

            it('should translate a "maximumQuantityReached" outcome into an "item_already_here" failure', () => {
                const action = createActionWithFakeInventory({ type: 'maximumQuantityReached' });

                const outcome = action.execute(createFakeContext(), { itemId: 'item_1' });

                expect(outcome).to.deep.include({ result: 'failure', reason: 'item_already_here' });
            });
        });
    });

    describe('schema', () => {
        it('should accept a valid item id', () => {
            expect(() => new DropAction().schema.parse({ itemId: 'item_1' })).to.not.throw();
        });

        it('should reject a missing item id', () => {
            expect(() => new DropAction().schema.parse({})).to.throw();
        });
    });
});
