import { defineEffectHandler } from '../defineEffectHandler';

export const handleDamage = defineEffectHandler('damage', (_ctx, _effect) => {
    throw new Error('damage effect not yet implemented');
});
