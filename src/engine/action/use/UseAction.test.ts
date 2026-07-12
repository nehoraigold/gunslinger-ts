import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { UseAction } from './UseAction';
import { Context, GameContext } from '../../context';
import { fakeContext, fakeInventory, fakeItem, fakePlayer } from '../../context/Context.test.utils';
import { Item } from '../../entity';
import { GameTransaction } from '../../transaction';
import { createGameState, ModifyState } from '../../state/GameState.test.utils';
import { DefaultRoomFactory, DefaultItemFactory, DefaultNpcFactory } from '../../entity';
import { GameState } from '../../state';
import { UseItemOutcome } from '../../service/useItem/UseItemOutcome';

describe(UseAction.name, () => {
    describe('execute', () => {
        describe('wired to the real UseItemService', () => {
            function createDefaultContext(modifyState?: ModifyState): Context {
                const state = createGameState(modifyState);
                return new GameContext(new GameTransaction(state), {
                    room: new DefaultRoomFactory(),
                    item: new DefaultItemFactory(),
                    npc: new DefaultNpcFactory(),
                });
            }

            function withHeldItem(itemId: string): (state: GameState) => void {
                return (state) => {
                    state.player.inventory[itemId] = 1;
                };
            }

            it('should apply a heal effect, consume the item, and return the effect in success data', () => {
                const ctx = createDefaultContext((state) => {
                    withHeldItem('item_1')(state);
                    state.items.item_1.useEffect = { type: 'heal', amount: 5 };
                    state.items.item_1.consumedOnUse = true;
                    state.player.health = { current: 10, max: 20 };
                });
                const action = new UseAction();

                const outcome = action.execute(ctx, { itemId: 'item_1' });

                expect(outcome).to.deep.equal({
                    result: 'success',
                    data: { itemId: 'item_1', effect: { type: 'heal', amount: 5 }, consumed: true },
                });
                expect(ctx.player().health().current()).to.equal(15);
                expect(ctx.player().inventory().has('item_1')).to.be.false;
            });

            it('should fail with not_carrying when the player does not have the item', () => {
                const ctx = createDefaultContext();
                const action = new UseAction();

                const outcome = action.execute(ctx, { itemId: 'item_1' });

                expect(outcome).to.deep.equal({ result: 'failure', reason: 'not_carrying', message: undefined });
            });

            it('should fail with not_usable when the item has no use effect', () => {
                const ctx = createDefaultContext(withHeldItem('item_1'));
                const action = new UseAction();

                const outcome = action.execute(ctx, { itemId: 'item_1' });

                expect(outcome).to.deep.equal({ result: 'failure', reason: 'not_usable', message: undefined });
            });
        });

        describe('with a fake UseItemService', () => {
            function createFakeContext(item: Item = fakeItem()): Context {
                return fakeContext({
                    player: () => fakePlayer({ inventory: () => fakeInventory({ has: () => true }) }),
                    requireItem: () => item,
                });
            }

            function createActionWithFakeService(outcome: UseItemOutcome) {
                return new UseAction(() => ({ use: sinon.stub().returns(outcome) }));
            }

            it('should translate a "used" outcome into a success outcome', () => {
                const action = createActionWithFakeService({
                    type: 'used',
                    effect: { type: 'revealLore', text: 'An old inscription.' },
                });

                const outcome = action.execute(createFakeContext(fakeItem({ consumedOnUse: false })), {
                    itemId: 'item_1',
                });

                expect(outcome).to.deep.equal({
                    result: 'success',
                    data: {
                        itemId: 'item_1',
                        effect: { type: 'revealLore', text: 'An old inscription.' },
                        consumed: false,
                    },
                });
            });

            it('should translate a "notCarried" outcome into a "not_carrying" failure', () => {
                const action = createActionWithFakeService({ type: 'notCarried' });

                const outcome = action.execute(createFakeContext(), { itemId: 'item_1' });

                expect(outcome).to.deep.include({ result: 'failure', reason: 'not_carrying' });
            });

            it('should translate a "notUsable" outcome into a "not_usable" failure', () => {
                const action = createActionWithFakeService({ type: 'notUsable' });

                const outcome = action.execute(createFakeContext(), { itemId: 'item_1' });

                expect(outcome).to.deep.include({ result: 'failure', reason: 'not_usable' });
            });
        });
    });

    describe('schema', () => {
        it('should accept a valid item id', () => {
            expect(() => new UseAction().schema.parse({ itemId: 'item_1' })).to.not.throw();
        });

        it('should reject missing item id', () => {
            expect(() => new UseAction().schema.parse({})).to.throw();
        });
    });
});
