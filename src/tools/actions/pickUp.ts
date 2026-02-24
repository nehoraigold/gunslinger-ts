import { z } from 'zod';
import { ItemSchema } from './common/schema';
import { defineActionOutcome } from './ActionOutcome';

export const PickUpFailReasonSchema = z.enum([
    'item_not_found',
    'insufficient_quantity',
    'too_heavy',
    'unable_to_pick_up',
]);

export const PickUpInputSchema = z.object({
    itemId: z.string(),
    quantity: z.number().min(1).optional(),
});

export const PickUpOutputSchema = defineActionOutcome(
    z.object({
        item: ItemSchema,
        inventoryCount: z.number(),
    }),
    PickUpFailReasonSchema,
);
