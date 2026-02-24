import { z } from 'zod';
import { DirectionSchema } from './common/schema';
import { defineActionOutcome } from './ActionOutcome';

const LookExitFailReasonSchema = z.enum(['exit_not_found']);
export const LookExitInputSchema = z.object({
    direction: DirectionSchema,
});

export const LookExitOutputSchema = defineActionOutcome(
    z.object({
        direction: DirectionSchema,
        destinationName: z.string(),
        description: z.string(),
        isBlocked: z.boolean(),
        blockReason: z.string().optional(),
    }),
    LookExitFailReasonSchema,
);
