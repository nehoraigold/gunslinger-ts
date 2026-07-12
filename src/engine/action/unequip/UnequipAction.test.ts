import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { UnequipAction } from './UnequipAction';
import { Context, GameContext } from '../../context';
import { fakeContext, fakePlayer } from '../../context/Context.test.utils';
import { GameTransaction } from '../../transaction';
import { createGameState, ModifyState } from '../../state/GameState.test.utils';
import { DefaultRoomFactory, DefaultItemFactory, DefaultNpcFactory } from '../../entity';
import { ItemState } from '../../state';
import { UnequipOutcome } from '../../service/equipment/EquipOutcome';

describe(UnequipAction.name, () => {
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

            it('should return the equipped item to the inventory and empty the slot', () => {
                const ctx = createDefaultContext((state) => {
                    state.items.revolver = revolver;
                    state.player.equipment.weapon = 'revolver';
                });

                const outcome = new UnequipAction().execute(ctx, { slot: 'weapon' });

                expect(outcome).to.deep.equal({ result: 'success', data: { itemId: 'revolver', slot: 'weapon' } });
                expect(ctx.player().equipment().equippedIn('weapon')).to.be.undefined;
                expect(ctx.player().inventory().has('revolver')).to.be.true;
            });

            it('should fail with slot_empty when the slot holds nothing', () => {
                const ctx = createDefaultContext();

                const outcome = new UnequipAction().execute(ctx, { slot: 'armor' });

                expect(outcome).to.deep.include({ result: 'failure', reason: 'slot_empty' });
            });
        });

        describe('with a fake EquipmentService', () => {
            function actionReturning(outcome: UnequipOutcome): UnequipAction {
                return new UnequipAction(() => ({ equip: sinon.stub(), unequip: sinon.stub().returns(outcome) }));
            }

            const ctx = () => fakeContext({ player: () => fakePlayer() });

            it('should translate an "unequipped" outcome into a success outcome', () => {
                const action = actionReturning({ type: 'unequipped', itemId: 'rusty_revolver', slot: 'weapon' });

                const outcome = action.execute(ctx(), { slot: 'weapon' });

                expect(outcome).to.deep.equal({
                    result: 'success',
                    data: { itemId: 'rusty_revolver', slot: 'weapon' },
                });
            });

            it('should translate a "slotEmpty" outcome into a slot_empty failure', () => {
                const outcome = actionReturning({ type: 'slotEmpty' }).execute(ctx(), { slot: 'armor' });

                expect(outcome).to.deep.include({ result: 'failure', reason: 'slot_empty' });
            });
        });
    });

    describe('schema', () => {
        it('should accept a valid slot', () => {
            expect(() => new UnequipAction().schema.parse({ slot: 'weapon' })).to.not.throw();
        });

        it('should reject an unknown slot', () => {
            expect(() => new UnequipAction().schema.parse({ slot: 'boots' })).to.throw();
        });
    });
});
