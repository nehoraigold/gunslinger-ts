import { z } from 'zod';
import { defineEffectHandler } from '../defineEffectHandler';

export const PoisonEffectSchema = z.object({
    type: z.literal('poison'),
    damage: z.number().describe('HP dealt per turn'),
    duration: z.number().describe('Number of turns the effect lasts'),
});

export const handlePoison = defineEffectHandler('poison', (_ctx, _effect) => {
    throw new Error('poison effect not yet implemented');
});
