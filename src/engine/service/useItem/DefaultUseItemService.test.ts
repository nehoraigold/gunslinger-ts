import { describe, it } from 'mocha';
import { expect } from 'chai';

import { DefaultUseItemService } from './DefaultUseItemService';
import { Context, GameContext } from '../../context';
import { GameTransaction } from '../../transaction';
import { createGameState, ModifyState } from '../../state/GameState.test.utils';
import { DefaultRoomFactory, DefaultItemFactory, DefaultNpcFactory } from '../../entity';
import { GameState } from '../../state';

describe(DefaultUseItemService.name, () => {
    const factories = {
        room: new DefaultRoomFactory(),
        item: new DefaultItemFactory(),
        npc: new DefaultNpcFactory(),
    };

    function contextWith(modifyState?: ModifyState): Context {
        return new GameContext(new GameTransaction(createGameState(modifyState)), factories);
    }

    function withHeldItem(itemId: string, quantity = 1): (s: GameState) => void {
        return (s: GameState) => {
            s.player.inventory[itemId] = quantity;
        };
    }

    it('should fail with notCarried when the player does not hold the item', () => {
        const ctx = contextWith();
        const service = new DefaultUseItemService(ctx);

        const outcome = service.use('item_1', ctx.requireItem('item_1'), ctx.player());

        expect(outcome).to.deep.equal({ type: 'notCarried' });
    });

    it('should fail with notUsable when the item has no use effect', () => {
        const ctx = contextWith(withHeldItem('item_1'));
        const service = new DefaultUseItemService(ctx);

        const outcome = service.use('item_1', ctx.requireItem('item_1'), ctx.player());

        expect(outcome).to.deep.equal({ type: 'notUsable' });
    });

    it('should apply the effect and report it as used', () => {
        const ctx = contextWith((s: GameState) => {
            withHeldItem('item_1')(s);
            s.items.item_1.useEffect = { type: 'heal', amount: 5 };
            s.player.health = { current: 10, max: 20 };
        });
        const service = new DefaultUseItemService(ctx);

        const outcome = service.use('item_1', ctx.requireItem('item_1'), ctx.player());

        expect(outcome).to.deep.equal({ type: 'used', effect: { type: 'heal', amount: 5 } });
        expect(ctx.player().health().current()).to.equal(15);
    });

    it('should leave the item in inventory when consumedOnUse is false', () => {
        const ctx = contextWith((s: GameState) => {
            withHeldItem('item_1')(s);
            s.items.item_1.useEffect = { type: 'heal', amount: 5 };
            s.items.item_1.consumedOnUse = false;
        });
        const service = new DefaultUseItemService(ctx);

        service.use('item_1', ctx.requireItem('item_1'), ctx.player());

        expect(ctx.player().inventory().has('item_1')).to.be.true;
    });

    it('should remove one from inventory when consumedOnUse is true', () => {
        const ctx = contextWith((s: GameState) => {
            withHeldItem('item_1', 2)(s);
            s.items.item_1.useEffect = { type: 'heal', amount: 5 };
            s.items.item_1.consumedOnUse = true;
        });
        const service = new DefaultUseItemService(ctx);

        service.use('item_1', ctx.requireItem('item_1'), ctx.player());

        expect(ctx.player().inventory().quantityOf('item_1')).to.equal(1);
    });
});
