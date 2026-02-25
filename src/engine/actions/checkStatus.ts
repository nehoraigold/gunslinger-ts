import { z } from 'zod';
import { defineActionOutcome } from './ActionOutcome';
import { ItemSchema, PlayerStatsSchema } from './common/schema';

const CheckStatusInputSchema = z.void();

export const CheckStatusOutputSchema = defineActionOutcome(
    z.object({
        health: z.number(),
        maxHealth: z.number(),
        healthProse: z.string(),
        currentRoomId: z.string(),
        baseStats: PlayerStatsSchema,
        activeStats: PlayerStatsSchema,
        gold: z.number(),
        turnCount: z.number(),
        equippedWeapon: ItemSchema.nullable(),
        equippedArmor: ItemSchema.nullable(),
    }),
    z.never(),
);
