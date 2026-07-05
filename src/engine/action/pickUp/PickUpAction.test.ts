import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { PickUpAction } from './PickUpAction';
import { Context, GameContext } from '../../context';
import { GameTransaction } from '../../transaction';
import { createGameState, ModifyState } from '../../state/GameState.test.utils';
import { DefaultRoomFactory, DefaultItemFactory, Inventory, Player, Room } from '../../entity';
import { GameState } from '../../state';
import { TransferOutcome } from '../../service/inventory/TransferOutcome';

describe(PickUpAction.name, () => {
    function createFakeContext(): Context {
        const fakeInventory: Inventory = {
            quantityOf: () => 0,
            has: () => false,
            add: () => {},
            remove: () => {},
            list: () => [],
        };
        const fakePlayer: Player = { currentRoomId: 'room_1', moveTo: () => {}, inventory: () => fakeInventory };
        const fakeRoom: Room = { id: 'room_1', getExit: () => undefined, inventory: () => fakeInventory };
        const unusedItem = () => {
            throw new Error('Context.item should not be used when the inventory service is faked');
        };
        return {
            player: () => fakePlayer,
            room: () => fakeRoom,
            item: unusedItem,
            requireCurrentRoom: () => fakeRoom,
        };
    }

    describe('execute', () => {
        describe('wired to the real InventoryService', () => {
            function createDefaultContext(modifyState?: ModifyState): Context {
                const state = createGameState(modifyState);
                return new GameContext(new GameTransaction(state), {
                    room: new DefaultRoomFactory(),
                    item: new DefaultItemFactory(),
                });
            }

            function withItemInRoom(itemId: string): (state: GameState) => void {
                return (state) => {
                    state.rooms[state.player.currentRoomId].inventory[itemId] = 1;
                };
            }

            it('should pick up the item and return a success outcome with the item id', () => {
                const ctx = createDefaultContext(withItemInRoom('item_1'));
                const action = new PickUpAction();

                const outcome = action.execute(ctx, { itemId: 'item_1' });

                expect(outcome).to.deep.equal({ result: 'success', data: { itemId: 'item_1' } });
                expect(ctx.player().inventory().quantityOf('item_1')).to.equal(1);
            });
        });

        describe('with a fake InventoryService', () => {
            function createActionWithFakeInventory(outcome: TransferOutcome) {
                return new PickUpAction(() => ({ transfer: sinon.stub().returns(outcome) }));
            }

            it('should translate a "transferred" outcome into a success outcome', () => {
                const action = createActionWithFakeInventory({ type: 'transferred', itemId: 'item_1', quantity: 1 });

                const outcome = action.execute(createFakeContext(), { itemId: 'item_1' });

                expect(outcome).to.deep.equal({ result: 'success', data: { itemId: 'item_1' } });
            });

            it('should translate a "notAvailable" outcome into a "not_in_room" failure', () => {
                const action = createActionWithFakeInventory({ type: 'notAvailable' });

                const outcome = action.execute(createFakeContext(), { itemId: 'item_1' });

                expect(outcome).to.deep.equal({ result: 'failure', reason: 'not_in_room', message: undefined });
            });

            it('should translate an "alreadyPresent" outcome into a "cannot_carry_more" failure', () => {
                const action = createActionWithFakeInventory({ type: 'alreadyPresent' });

                const outcome = action.execute(createFakeContext(), { itemId: 'item_1' });

                expect(outcome).to.deep.equal({ result: 'failure', reason: 'cannot_carry_more', message: undefined });
            });
        });
    });

    describe('schema', () => {
        it('should accept a valid item id', () => {
            expect(() => new PickUpAction().schema.parse({ itemId: 'item_1' })).to.not.throw();
        });

        it('should reject a missing item id', () => {
            expect(() => new PickUpAction().schema.parse({})).to.throw();
        });
    });
});
