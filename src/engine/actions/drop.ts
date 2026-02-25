import { z } from 'zod';
import { ItemSchema } from './common/schema';
import { defineActionOutcome } from './ActionOutcome';

export const DropFailReasonSchema = z.enum(['not_found', 'insufficient_quantity', 'unable_to_drop']);

export const DropInputSchema = z.object({
    itemId: z.string(),
    quantity: z.number().min(1).optional(),
});

export const DropOutputSchema = defineActionOutcome(
    z.object({
        item: ItemSchema,
        droppedInRoomId: z.string(),
        wasEquipped: z.boolean(),
        inventoryCount: z.number(),
    }),
    DropFailReasonSchema,
);
