import { z } from 'zod';
import { ItemSchema, PlayerStatsSchema } from './common/schema';
import { EquipSlot } from '../player';
import { defineActionOutcome } from './ActionOutcome';

const EquipSlotSchema: z.ZodType<EquipSlot> = z.enum(['weapon', 'armor']);
export const EquipFailReasonSchema = z.enum(['not_found', 'wrong_type', 'stat_requirement_not_met']);

export const EquipInputSchema = z.object({
    itemId: z.string(),
});

export const EquipOutputSchema = defineActionOutcome(
    z.object({
        item: ItemSchema,
        slot: EquipSlotSchema,
        previouslyEquipped: ItemSchema.nullable(),
        newStats: PlayerStatsSchema,
    }),
    EquipFailReasonSchema,
);
