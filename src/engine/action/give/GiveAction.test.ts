import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { GiveAction } from './GiveAction';
import { Context, GameContext } from '../../context';
import { fakeContext, fakeInventory, fakeNpc, fakePlayer, fakeRoom } from '../../context/Context.test.utils';
import { GameTransaction } from '../../transaction';
import { createGameState, ModifyState } from '../../state/GameState.test.utils';
import { DefaultRoomFactory, DefaultItemFactory, DefaultNpcFactory } from '../../entity';
import { GameState } from '../../state';
import { TransferOutcome } from '../../service/inventory/TransferOutcome';

describe(GiveAction.name, () => {
    const input = { npcId: 'npc_1', itemId: 'item_1' };

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

            function withNpcInRoom(npcId: string): (state: GameState) => void {
                return (state) => {
                    state.rooms[state.player.currentRoomId].npcIds.push(npcId);
                };
            }

            function withItemInInventory(itemId: string, quantity: number): (state: GameState) => void {
                return (state) => {
                    state.player.inventory[itemId] = quantity;
                };
            }

            it('should transfer the item from the player to the npc and return a success outcome', () => {
                const ctx = createDefaultContext((state) => {
                    withNpcInRoom('npc_1')(state);
                    withItemInInventory('item_1', 1)(state);
                });
                const action = new GiveAction();

                const outcome = action.execute(ctx, input);

                expect(outcome).to.deep.equal({ result: 'success', data: { itemId: 'item_1', quantity: 1 } });
                expect(ctx.player().inventory().quantityOf('item_1')).to.equal(0);
                expect(ctx.requireNpc('npc_1').inventory().quantityOf('item_1')).to.equal(1);
            });

            it('should fail with not_here when the npc is not in the current room', () => {
                const ctx = createDefaultContext(withItemInInventory('item_1', 1));
                const action = new GiveAction();

                const outcome = action.execute(ctx, input);

                expect(outcome).to.deep.equal({ result: 'failure', reason: 'not_here', message: undefined });
            });

            it('should fail with not_carrying when the player does not have the item', () => {
                const ctx = createDefaultContext(withNpcInRoom('npc_1'));
                const action = new GiveAction();

                const outcome = action.execute(ctx, input);

                expect(outcome).to.deep.include({ result: 'failure', reason: 'not_carrying' });
            });
        });

        describe('with a fake InventoryService', () => {
            function createFakeContext(): Context {
                return fakeContext({
                    player: () => fakePlayer({ inventory: () => fakeInventory({ has: () => true }) }),
                    requireCurrentRoom: () => fakeRoom({ npcIds: () => ['npc_1'] }),
                    requireNpc: () => fakeNpc({ inventory: () => fakeInventory() }),
                });
            }

            function createActionWithFakeInventory(outcome: TransferOutcome) {
                return new GiveAction(() => ({ transfer: sinon.stub().returns(outcome) }));
            }

            it('should translate a "transferred" outcome into a success outcome', () => {
                const action = createActionWithFakeInventory({ type: 'transferred', itemId: 'item_1', quantity: 2 });

                const outcome = action.execute(createFakeContext(), input);

                expect(outcome).to.deep.equal({ result: 'success', data: { itemId: 'item_1', quantity: 2 } });
            });

            it('should fail with not_here without consulting the inventory service when the npc is absent', () => {
                const transfer = sinon.stub();
                const ctx = fakeContext({
                    player: () => fakePlayer(),
                    requireCurrentRoom: () => fakeRoom({ npcIds: () => [] }),
                });
                const action = new GiveAction(() => ({ transfer }));

                const outcome = action.execute(ctx, input);

                expect(outcome).to.deep.include({ result: 'failure', reason: 'not_here' });
                expect(transfer.called).to.be.false;
            });

            it('should translate a "notAvailable" outcome into a "not_carrying" failure', () => {
                const action = createActionWithFakeInventory({ type: 'notAvailable' });

                const outcome = action.execute(createFakeContext(), input);

                expect(outcome).to.deep.include({ result: 'failure', reason: 'not_carrying' });
            });

            it('should translate an "insufficientQuantity" outcome into a "not_enough_carried" failure', () => {
                const action = createActionWithFakeInventory({ type: 'insufficientQuantity' });

                const outcome = action.execute(createFakeContext(), input);

                expect(outcome).to.deep.include({ result: 'failure', reason: 'not_enough_carried' });
            });

            it('should translate a "maximumQuantityReached" outcome into an "npc_cannot_receive" failure', () => {
                const action = createActionWithFakeInventory({ type: 'maximumQuantityReached' });

                const outcome = action.execute(createFakeContext(), input);

                expect(outcome).to.deep.include({ result: 'failure', reason: 'npc_cannot_receive' });
            });
        });
    });

    describe('schema', () => {
        it('should accept input without a quantity', () => {
            expect(() => new GiveAction().schema.parse(input)).to.not.throw();
        });

        it('should accept input with a quantity', () => {
            expect(() => new GiveAction().schema.parse({ ...input, quantity: 3 })).to.not.throw();
        });

        it('should reject a non-positive quantity', () => {
            expect(() => new GiveAction().schema.parse({ ...input, quantity: 0 })).to.throw();
        });

        it('should reject input missing the item id', () => {
            expect(() => new GiveAction().schema.parse({ npcId: 'npc_1' })).to.throw();
        });
    });
});
