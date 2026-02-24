import { z } from 'zod';
import { ItemSchema } from './common/schema';
import { defineActionOutcome } from './ActionOutcome';

export const CheckInventoryInputSchema = z.void();

export const CheckInventoryOutputSchema = defineActionOutcome(
    z.object({
        items: z.array(ItemSchema.extend(z.object({ quantity: z.number() }))),
        equippedWeapon: ItemSchema.nullable(),
        equippedArmor: ItemSchema.nullable(),
        gold: z.number(),
    }),
    z.never(),
);
