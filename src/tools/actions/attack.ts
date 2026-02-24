import { z } from 'zod';
import { AttackType } from '../../engine/combat';
import { ItemSchema } from './common/schema';
import { defineActionOutcome } from './ActionOutcome';

const AttackFailReasonSchema = z.enum(['not_in_combat', 'enemy_not_found', 'enemy_already_defeated']);
const AttackTypeSchema: z.ZodType<AttackType> = z.enum(['hit', 'miss', 'critical', 'glancing']);

export const AttackInputSchema = z.object({
    targetId: z.string(),
    ability: z.string().optional(),
});

export const AttackOutputSchema = defineActionOutcome(
    z.object({
        playerDamageDealt: z.number(),
        playerAttackType: AttackTypeSchema,
        enemyDamageDealt: z.number(),
        enemyAttackType: AttackTypeSchema,
        playerHealthProse: z.string(),
        enemyHealthProse: z.string(),
        enemyDefeated: z.boolean(),
        playerDefeated: z.boolean(),
        lootDropped: z.array(ItemSchema).optional(),
        xpGained: z.number().optional(),
    }),
    AttackFailReasonSchema,
);
