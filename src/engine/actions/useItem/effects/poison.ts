import { defineEffectHandler } from '../defineEffectHandler';

export const handlePoison = defineEffectHandler('poison', (_ctx, _effect) => {
    throw new Error('poison effect not yet implemented');
});
