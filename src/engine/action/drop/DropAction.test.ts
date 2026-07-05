import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { DropAction } from './DropAction';
import { Context, GameContext } from '../../context';
import { GameTransaction } from '../../transaction';
import { createGameState, ModifyState } from '../../state/GameState.test.utils';
import { DefaultRoomFactory, DefaultItemFactory, Inventory, Player, Room } from '../../entity';
import { GameState } from '../../state';
import { TransferOutcome } from '../../service/inventory/TransferOutcome';

describe(DropAction.name, () => {
    function createFakeContext(): Context {
        const fakeInventory: Inventory = {
            quantityOf: () => 0,
            has: () => false,
            add: () => {},
            remove: () => {},
            list: () => [],
        };
        const fakePlayer: Player = { currentRoomId: 'room_1', moveTo: () => {}, inventory: () => fakeInventory };
        const fakeRoom: Room = {
            id: 'room_1',
            name: 'Room 1',
            description: '',
            lightLevel: 'bright',
            visited: false,
            getExit: () => undefined,
            exits: () => [],
            markVisited: () => {},
            inventory: () => fakeInventory,
        };
        const unusedItem = () => {
            throw new Error('Context.item should not be used when the inventory service is faked');
        };
        return {
            player: () => fakePlayer,
            room: () => fakeRoom,
            requireRoom: () => fakeRoom,
            item: unusedItem,
            requireItem: unusedItem,
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

                expect(outcome).to.deep.equal({ result: 'failure', reason: 'not_in_inventory', message: undefined });
            });

            it('should translate an "alreadyPresent" outcome into an "item_already_here" failure', () => {
                const action = createActionWithFakeInventory({ type: 'alreadyPresent' });

                const outcome = action.execute(createFakeContext(), { itemId: 'item_1' });

                expect(outcome).to.deep.equal({ result: 'failure', reason: 'item_already_here', message: undefined });
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
