import { EffectApplier } from '../EffectApplier';

export type RevealItemEffect = { type: 'revealItem'; itemId: string };

export const applyRevealItem: EffectApplier<RevealItemEffect> = (ctx, effect) => {
    ctx.requireItem(effect.itemId);
    ctx.requireCurrentRoom().inventory().add(effect.itemId, 1);
};
