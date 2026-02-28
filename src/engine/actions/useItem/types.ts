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
});

export const failReasonSchema = z.string();

export type UseItemResult = ExecuteResult<z.infer<ActionOutcome<typeof successDataSchema, typeof failReasonSchema>>>;

export interface EffectHandlerContext {
    state: GameState;
    item: Item;
    quantity: number;
    targetId?: string;
}
