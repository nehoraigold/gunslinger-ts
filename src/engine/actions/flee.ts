import { z } from 'zod';
import { defineActionOutcome } from './ActionOutcome';

export const FleeFailReasonSchema = z.enum(['cornered', 'too_slow', 'unable_to_flee']);

export const FleeInputSchema = z.void();

export const FleeOutputSchema = defineActionOutcome(
    z.object({
        success: z.boolean(),
        escapedToRoomId: z.string().optional(),
        escapedToRoomName: z.string().optional(),
        damageTaken: z.number(),
        playerHealthProse: z.string(),
    }),
    FleeFailReasonSchema,
);
