import { z } from 'zod';
import { defineActionOutcome } from './ActionOutcome';
import { NpcMoodSchema } from './common/schema';

const TalkToFailReasonSchema = z.enum(['npc_not_found', 'in_combat', 'npc_dead']);
export const TalkToInputSchema = z.object({
    npcId: z.string(),
    message: z.string().optional(),
    dialogueNode: z.string().optional(),
});

export const TalkToOutputSchema = defineActionOutcome(
    z.object({
        npcId: z.string(),
        npcName: z.string(),
        mood: NpcMoodSchema,
        knowledgeTopics: z.array(z.string()),
        dialogueHints: z.array(z.string()),
    }),
    TalkToFailReasonSchema,
);
