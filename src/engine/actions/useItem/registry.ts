import { UseEffect } from '../../item';
import { EffectHandlerContext, UseItemResult } from './types';
import { EffectHandlerFn, EffectHandlerRegistry } from './defineEffectHandler';
import { handleHeal } from './effects/heal';
import { handleUnlock } from './effects/unlock';
import { handleDamage } from './effects/damage';
import { handlePoison } from './effects/poison';
import { handleRevealLore } from './effects/revealLore';
import { handleApplyBuff } from './effects/applyBuff';
import { handleRevealItem } from './effects/revealItem';

const registry: EffectHandlerRegistry = {
    heal: handleHeal,
    unlock: handleUnlock,
    damage: handleDamage,
    poison: handlePoison,
    revealLore: handleRevealLore,
    applyBuff: handleApplyBuff,
    revealItem: handleRevealItem,
};

export function resolveEffect(ctx: EffectHandlerContext, effect: UseEffect): UseItemResult {
    const handler = registry[effect.type] as EffectHandlerFn<UseEffect['type']>;
    return (handler as (ctx: EffectHandlerContext, effect: UseEffect) => UseItemResult)(ctx, effect);
}
