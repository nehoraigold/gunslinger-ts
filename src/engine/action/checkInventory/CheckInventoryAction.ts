import { z } from 'zod';
import { Action } from '../Action';
import { ActionOutcome, defineActionOutcome } from '../ActionOutcome';
import { Context } from '../../context';
import { Schema, ZodSchema } from '../../../utils/schema';

const CheckInventoryInputSchema = z.void();
const CheckInventorySuccessDataSchema = z.object({
    items: z.array(z.object({ itemId: z.string(), name: z.string(), quantity: z.number() })),
});
const CheckInventoryFailReasonSchema = z.never();
const CheckInventoryOutcomeSchema = defineActionOutcome(
    CheckInventorySuccessDataSchema,
    CheckInventoryFailReasonSchema,
);

type CheckInventoryInput = z.infer<typeof CheckInventoryInputSchema>;
type CheckInventoryOutcome = z.infer<typeof CheckInventoryOutcomeSchema>;

export class CheckInventoryAction implements Action<CheckInventoryInput, CheckInventoryOutcome> {
    readonly name = 'checkInventory';
    readonly schema: Schema<CheckInventoryInput> = new ZodSchema(CheckInventoryInputSchema);
    readonly outcomeSchema = CheckInventoryOutcomeSchema;

    execute(ctx: Context): CheckInventoryOutcome {
        const items = ctx
            .player()
            .inventory()
            .list()
            .map(({ itemId, quantity }) => ({
                itemId,
                name: ctx.requireItem(itemId).name,
                quantity,
            }));
        return ActionOutcome.succeed({ items });
    }
}
