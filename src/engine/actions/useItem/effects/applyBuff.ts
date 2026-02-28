import { z } from 'zod';
import { defineEffectHandler } from '../defineEffectHandler';

export const ApplyBuffEffectSchema = z.object({
    type: z.literal('applyBuff'),
    effectId: z.string(),
    name: z.string(),
    description: z.string(),
    duration: z.number().describe('Number of turns the buff lasts'),
});

export const handleApplyBuff = defineEffectHandler('applyBuff', (_ctx, _effect) => {
    throw new Error('applyBuff effect not yet implemented');
});
