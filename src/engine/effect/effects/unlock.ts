import { EffectApplier } from '../EffectApplier';

export type UnlockEffect = { type: 'unlock'; flagKey: string };

export const applyUnlock: EffectApplier<UnlockEffect> = (ctx, effect) => {
    ctx.flags().set(effect.flagKey, true);
};
