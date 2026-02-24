import { z } from 'zod';
import { NpcSummarySchema } from './common/schema';
import { defineActionOutcome } from './ActionOutcome';

export const LookNpcFailReasonSchema = z.enum(['npc_not_found']);

export const LookNpcInputSchema = z.object({
    npcId: z.string().describe('The ID of the NPC'),
});

export const LookNpcOutputSchema = defineActionOutcome(
    NpcSummarySchema.extend(
        z.object({
            description: z.string(),
            notableFeatures: z.array(z.string()).optional(),
            visibleEquipment: z.array(z.string()).optional(),
        }),
    ),
    LookNpcFailReasonSchema,
);
