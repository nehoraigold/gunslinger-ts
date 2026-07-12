import { EffectApplier } from '../EffectApplier';

export type HealEffect = { type: 'heal'; amount: number };

export const applyHeal: EffectApplier<HealEffect> = (ctx, effect) => {
    ctx.player().health().heal(effect.amount);
};
