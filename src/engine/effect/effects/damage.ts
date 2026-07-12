import { EffectApplier } from '../EffectApplier';

export type DamageEffect = { type: 'damage'; amount: number };

export const applyDamage: EffectApplier<DamageEffect> = (ctx, effect) => {
    ctx.player().health().damage(effect.amount);
};
