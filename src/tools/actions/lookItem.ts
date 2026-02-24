import { z } from 'zod';
import { ItemSchema } from './common/schema';
import { defineActionOutcome } from './ActionOutcome';

const LookItemFailReasonSchema = z.enum(['item_not_found']);
export const LookItemInputSchema = z.object({
    itemId: z.string().describe('The item ID'),
});

export const LookItemOutputSchema = defineActionOutcome(
    ItemSchema.extend(
        z.object({
            location: z.enum(['inventory', 'room', 'equipped']),
            quantity: z.number(),
        }),
    ),
    LookItemFailReasonSchema,
);
