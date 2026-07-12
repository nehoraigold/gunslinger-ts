import { describe, it } from 'mocha';
import { expect } from 'chai';

import { applyItemEffect } from './applyItemEffect';
import { ItemEffect } from './ItemEffect';
import { Context, GameContext } from '../context';
import { GameTransaction } from '../transaction';
import { createGameState, ModifyState } from '../state/GameState.test.utils';
import { DefaultRoomFactory, DefaultItemFactory, DefaultNpcFactory } from '../entity';
import { GameState } from '../state';

describe('applyItemEffect', () => {
    const factories = {
        room: new DefaultRoomFactory(),
        item: new DefaultItemFactory(),
        npc: new DefaultNpcFactory(),
    };

    function contextWith(modifyState?: ModifyState): Context {
        return new GameContext(new GameTransaction(createGameState(modifyState)), factories);
    }

    describe('heal', () => {
        it('should heal the player, clamped at max health', () => {
            const effect: ItemEffect = { type: 'heal', amount: 5 };
            const ctx = contextWith((s: GameState) => {
                s.player.health = { current: 15, max: 20 };
            });

            applyItemEffect(ctx, effect);

            expect(ctx.player().health().current()).to.equal(20);
        });
    });

    describe('damage', () => {
        it('should damage the player, clamped at zero', () => {
            const effect: ItemEffect = { type: 'damage', amount: 30 };
            const ctx = contextWith((s: GameState) => {
                s.player.health = { current: 15, max: 20 };
            });

            applyItemEffect(ctx, effect);

            expect(ctx.player().health().current()).to.equal(0);
        });
    });

    describe('unlock', () => {
        it('should set the given flag to true', () => {
            const effect: ItemEffect = { type: 'unlock', flagKey: 'gate_open' };
            const ctx = contextWith();

            applyItemEffect(ctx, effect);

            expect(ctx.flags().get('gate_open')).to.equal(true);
        });
    });

    describe('revealItem', () => {
        it('should add the item to the current room inventory', () => {
            const effect: ItemEffect = { type: 'revealItem', itemId: 'item_2' };
            const ctx = contextWith();

            applyItemEffect(ctx, effect);

            expect(ctx.requireCurrentRoom().inventory().quantityOf('item_2')).to.equal(1);
        });

        it('should throw an ItemNotFoundError for an unknown item id', () => {
            const effect: ItemEffect = { type: 'revealItem', itemId: 'nonexistent' };
            const ctx = contextWith();

            expect(() => applyItemEffect(ctx, effect)).to.throw(/nonexistent/);
        });
    });

    describe('revealLore', () => {
        it('should not mutate player health or flags', () => {
            const effect: ItemEffect = { type: 'revealLore', text: 'The amulet was forged in a colder age.' };
            const ctx = contextWith();
            const healthBefore = ctx.player().health().current();

            applyItemEffect(ctx, effect);

            expect(ctx.player().health().current()).to.equal(healthBefore);
            expect(ctx.flags().has('revealed')).to.be.false;
        });
    });
});
