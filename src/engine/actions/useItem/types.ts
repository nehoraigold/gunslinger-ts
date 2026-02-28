import { z } from 'zod';
import { GameState } from '../../state/GameState';
import { Item } from '../../item';
import { ActionOutcome } from '../ActionOutcome';
import { ExecuteResult } from '../Action';
import { UseEffectSchema, DirectionSchema, HealthProseSchema } from '../common/schema';

export const successDataSchema = z.object({
    effect: UseEffectSchema.describe('The effect that was applied'),
    itemConsumed: z.boolean().describe('Whether the item was removed from inventory'),
    newPlayerHealth: HealthProseSchema.optional().describe('Player health after a heal effect'),
    unlockedExits: z.array(DirectionSchema).optional().describe('Exits in the current room that were unblocked'),
    targetHealthProse: HealthProseSchema.optional().describe('Target NPC health after a damage or poison effect'),
    targetDefeated: z.boolean().optional().describe('Whether the target NPC was defeated by this effect'),
    xpGained: z.number().optional().describe('XP awarded if the target was defeated'),
});

export const failReasonSchema = z.string();

export type UseItemResult = ExecuteResult<z.infer<ActionOutcome<typeof successDataSchema, typeof failReasonSchema>>>;

export interface EffectHandlerContext {
    state: GameState;
    item: Item;
    quantity: number;
    targetId?: string;
}
