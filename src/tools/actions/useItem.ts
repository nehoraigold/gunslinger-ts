import { z } from 'zod';
import { UseEffect } from '../../engine/item';
import { defineActionOutcome } from './ActionOutcome';

const ItemEffectSchema: z.ZodType<UseEffect> = z.enum([
    'healed',
    'unlocked',
    'poisoned_target',
    'damaged_target',
    'buff_applied',
    'lore_revealed',
    'none',
]);

const UseItemFailReasonSchema = z.enum(['not_in_inventory', 'no_valid_target', 'item_not_usable', 'wrong_key']);

export const UseItemInputSchema = z.object({
    itemId: z.string(),
    targetId: z.string().optional(),
});

export const UseItemOutputSchema = defineActionOutcome(
    z.object({
        effect: ItemEffectSchema,
        itemConsumed: z.boolean(),
        value: z.number().optional(),
        targetStateChange: z.string().optional(),
    }),
    UseItemFailReasonSchema,
);
