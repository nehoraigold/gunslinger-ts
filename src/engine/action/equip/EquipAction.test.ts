import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { EquipAction } from './EquipAction';
import { Context, GameContext } from '../../context';
import { fakeContext } from '../../context/Context.test.utils';
import { GameTransaction } from '../../transaction';
import { createGameState, ModifyState } from '../../state/GameState.test.utils';
import { DefaultRoomFactory, DefaultItemFactory, DefaultNpcFactory } from '../../entity';
import { EquipOutcome } from '../../service/equipment/EquipOutcome';

describe(EquipAction.name, () => {
    describe('execute', () => {
        describe('wired to the real EquipmentService', () => {
            function createDefaultContext(modifyState?: ModifyState): Context {
                const state = createGameState(modifyState);
                return new GameContext(new GameTransaction(state), {
                    room: new DefaultRoomFactory(),
                    item: new DefaultItemFactory(),
                    npc: new DefaultNpcFactory(),
                });
            }

            it('should move a carried weapon into the weapon slot and return the slot', () => {
                const ctx = createDefaultContext((state) => {
                    state.player.inventory.item_1 = 1;
                });
                const action = new EquipAction();

                const outcome = action.execute(ctx, { itemId: 'item_1' });

                expect(outcome).to.deep.equal({
                    result: 'success',
                    data: { itemId: 'item_1', slot: 'weapon', displacedItemId: undefined },
                });
                expect(ctx.player().equipment().equippedIn('weapon')).to.equal('item_1');
                expect(ctx.player().inventory().has('item_1')).to.be.false;
            });

            it('should fail with not_equippable for an item whose type has no slot', () => {
                const ctx = createDefaultContext((state) => {
                    state.player.inventory.item_2 = 1;
                });

                const outcome = new EquipAction().execute(ctx, { itemId: 'item_2' });

                expect(outcome).to.deep.include({ result: 'failure', reason: 'not_equippable' });
            });

            it('should fail with not_in_inventory when the item is not carried', () => {
                const ctx = createDefaultContext();

                const outcome = new EquipAction().execute(ctx, { itemId: 'item_1' });

                expect(outcome).to.deep.include({ result: 'failure', reason: 'not_in_inventory' });
            });
        });

        describe('with a fake EquipmentService', () => {
            function actionReturning(outcome: EquipOutcome): EquipAction {
                return new EquipAction(() => ({ equip: sinon.stub().returns(outcome), unequip: sinon.stub() }));
            }

            it('should translate an "equipped" outcome, surfacing any displaced item', () => {
                const action = actionReturning({
                    type: 'equipped',
                    itemId: 'saber',
                    slot: 'weapon',
                    displaced: 'revolver',
                });

                const outcome = action.execute(fakeContext(), { itemId: 'saber' });

                expect(outcome).to.deep.equal({
                    result: 'success',
                    data: { itemId: 'saber', slot: 'weapon', displacedItemId: 'revolver' },
                });
            });

            it('should translate a "notEquippable" outcome into a not_equippable failure', () => {
                const outcome = actionReturning({ type: 'notEquippable' }).execute(fakeContext(), { itemId: 'potion' });

                expect(outcome).to.deep.include({ result: 'failure', reason: 'not_equippable' });
            });

            it('should translate a "notCarried" outcome into a not_in_inventory failure', () => {
                const outcome = actionReturning({ type: 'notCarried' }).execute(fakeContext(), { itemId: 'saber' });

                expect(outcome).to.deep.include({ result: 'failure', reason: 'not_in_inventory' });
            });

            it('should translate an "alreadyEquipped" outcome into an already_equipped failure', () => {
                const outcome = actionReturning({ type: 'alreadyEquipped' }).execute(fakeContext(), {
                    itemId: 'saber',
                });

                expect(outcome).to.deep.include({ result: 'failure', reason: 'already_equipped' });
            });
        });
    });

    describe('schema', () => {
        it('should accept a valid item id', () => {
            expect(() => new EquipAction().schema.parse({ itemId: 'item_1' })).to.not.throw();
        });

        it('should reject a missing item id', () => {
            expect(() => new EquipAction().schema.parse({})).to.throw();
        });
    });
});
