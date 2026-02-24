import { z } from 'zod';
import { defineToolResult } from '../ToolResult';
import { ExitSummarySchema, ItemSummarySchema, NpcSummarySchema, LightLevelSchema } from './common/schema';
import { defineActionOutcome } from './ActionOutcome';

export const LookRoomInputSchema = z.void();

export const LookRoomOutputSchema = defineActionOutcome(
    z.object({
        id: z.string().describe('The room ID'),
        name: z.string().describe('The room name'),
        description: z.string().describe('The room description'),
        exits: z.array(ExitSummarySchema).describe('The exits in this room'),
        items: z.array(ItemSummarySchema).describe('The items present in this room'),
        npcs: z.array(NpcSummarySchema).describe('The NPCs present in this room'),
        ambientDetail: z.string().optional().describe('An ambient detail about the room'),
        lightLevel: LightLevelSchema.describe('The light level of the room'),
    }),
    z.never(),
);
