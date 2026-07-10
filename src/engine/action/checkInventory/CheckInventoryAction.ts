import { z } from 'zod';
import { Action } from '../Action';
import { ActionOutcome, defineActionOutcome } from '../ActionOutcome';
import { Context } from '../../context';
import { EquipSlot } from '../../state';
import { Schema, ZodSchema } from '../../../utils/schema';

const EQUIP_SLOTS: EquipSlot[] = ['weapon', 'armor'];

const CheckInventoryInputSchema = z.void();
const CheckInventorySuccessDataSchema = z.object({
    items: z.array(z.object({ itemId: z.string(), name: z.string(), quantity: z.number() })),
    equipped: z.array(z.object({ slot: z.enum(['weapon', 'armor']), itemId: z.string(), name: z.string() })),
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
        const player = ctx.player();
        const items = player
            .inventory()
            .list()
            .map(({ itemId, quantity }) => ({
                itemId,
                name: ctx.requireItem(itemId).name,
                quantity,
            }));
        const equipped = EQUIP_SLOTS.flatMap((slot) => {
            const itemId = player.equipment().equippedIn(slot);
            return itemId === undefined ? [] : [{ slot, itemId, name: ctx.requireItem(itemId).name }];
        });
        return ActionOutcome.succeed({ items, equipped });
    }
}
