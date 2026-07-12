import { Context } from '../context';
import { ItemEffect } from './ItemEffect';
import { EffectApplier } from './EffectApplier';
import { applyHeal } from './effects/heal';
import { applyDamage } from './effects/damage';
import { applyUnlock } from './effects/unlock';
import { applyRevealItem } from './effects/revealItem';
import { applyRevealLore } from './effects/revealLore';

type ApplierMap = { [K in ItemEffect['type']]: EffectApplier<Extract<ItemEffect, { type: K }>> };

export function applyItemEffect<K extends ItemEffect['type']>(
    ctx: Context,
    effect: Extract<ItemEffect, { type: K }>,
): void {
    appliers[effect.type](ctx, effect);
}

const appliers: ApplierMap = {
    heal: applyHeal,
    damage: applyDamage,
    unlock: applyUnlock,
    revealItem: applyRevealItem,
    revealLore: applyRevealLore,
};
