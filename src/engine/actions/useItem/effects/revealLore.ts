import { z } from 'zod';
import { defineEffectHandler } from '../defineEffectHandler';

export const RevealLoreEffectSchema = z.object({
    type: z.literal('revealLore'),
    text: z.string().describe('The lore text revealed'),
});

export const handleRevealLore = defineEffectHandler('revealLore', (_ctx, _effect) => {
    throw new Error('revealLore effect not yet implemented');
});
