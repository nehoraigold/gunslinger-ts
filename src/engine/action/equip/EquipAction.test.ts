import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { EquipAction } from './EquipAction';
import { Context, GameContext } from '../../context';
import { fakeContext, fakePlayer } from '../../context/Context.test.utils';
import { GameTransaction } from '../../transaction';
import { createGameState, ModifyState } from '../../state/GameState.test.utils';
import { DefaultRoomFactory, DefaultItemFactory, DefaultNpcFactory } from '../../entity';
import { ItemState } from '../../state';
import { EquipOutcome } from '../../service/equipment/EquipOutcome';

describe(EquipAction.name, () => {
    const revolver: ItemState = {
        name: 'Rusty Revolver',
        description: '',
        type: 'weapon',
        stackable: false,
        value: 0,
        weight: 0,
        takeable: true,
        droppable: true,
        consumedOnUse: false,
    };
    const potion: ItemState = { ...revolver, name: 'Healing Potion', type: 'consumable', stackable: true };

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
                    state.items.revolver = revolver;
                    state.player.inventory.revolver = 1;
                });
                const action = new EquipAction();

                const outcome = action.execute(ctx, { itemId: 'revolver' });

                expect(outcome).to.deep.equal({
                    result: 'success',
                    data: { itemId: 'revolver', slot: 'weapon', displacedItemId: undefined },
                });
                expect(ctx.player().equipment().equippedIn('weapon')).to.equal('revolver');
                expect(ctx.player().inventory().has('revolver')).to.be.false;
            });

            it('should fail with not_equippable for an item whose type has no slot', () => {
                const ctx = createDefaultContext((state) => {
                    state.items.potion = potion;
                    state.player.inventory.potion = 1;
                });

                const outcome = new EquipAction().execute(ctx, { itemId: 'potion' });

                expect(outcome).to.deep.include({ result: 'failure', reason: 'not_equippable' });
            });

            it('should fail with not_in_inventory when the item is not carried', () => {
                const ctx = createDefaultContext((state) => {
                    state.items.revolver = revolver;
                });

                const outcome = new EquipAction().execute(ctx, { itemId: 'revolver' });

                expect(outcome).to.deep.include({ result: 'failure', reason: 'not_in_inventory' });
            });
        });

        describe('with a fake EquipmentService', () => {
            function actionReturning(outcome: EquipOutcome): EquipAction {
                return new EquipAction(() => ({ equip: sinon.stub().returns(outcome), unequip: sinon.stub() }));
            }

            const ctx = () => fakeContext({ player: () => fakePlayer() });

            it('should translate an "equipped" outcome, surfacing any displaced item', () => {
                const action = actionReturning({
                    type: 'equipped',
                    itemId: 'steel_saber',
                    slot: 'weapon',
                    displaced: 'rusty_revolver',
                });

                const outcome = action.execute(ctx(), { itemId: 'steel_saber' });

                expect(outcome).to.deep.equal({
                    result: 'success',
                    data: { itemId: 'steel_saber', slot: 'weapon', displacedItemId: 'rusty_revolver' },
                });
            });

            it('should translate a "notEquippable" outcome into a not_equippable failure', () => {
                const outcome = actionReturning({ type: 'notEquippable' }).execute(ctx(), { itemId: 'healing_potion' });

                expect(outcome).to.deep.include({ result: 'failure', reason: 'not_equippable' });
            });

            it('should translate a "notCarried" outcome into a not_in_inventory failure', () => {
                const outcome = actionReturning({ type: 'notCarried' }).execute(ctx(), { itemId: 'steel_saber' });

                expect(outcome).to.deep.include({ result: 'failure', reason: 'not_in_inventory' });
            });

            it('should translate an "alreadyEquipped" outcome into an already_equipped failure', () => {
                const outcome = actionReturning({ type: 'alreadyEquipped' }).execute(ctx(), { itemId: 'steel_saber' });

                expect(outcome).to.deep.include({ result: 'failure', reason: 'already_equipped' });
            });
        });
    });

    describe('schema', () => {
        it('should accept a valid item id', () => {
            expect(() => new EquipAction().schema.parse({ itemId: 'rusty_revolver' })).to.not.throw();
        });

        it('should reject a missing item id', () => {
            expect(() => new EquipAction().schema.parse({})).to.throw();
        });
    });
});
