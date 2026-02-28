import { z } from 'zod';
import { defineEffectHandler } from '../defineEffectHandler';

export const DamageEffectSchema = z.object({
    type: z.literal('damage'),
    value: z.number().describe('HP dealt to target'),
});

export const handleDamage = defineEffectHandler('damage', (_ctx, _effect) => {
    throw new Error('damage effect not yet implemented');
});
