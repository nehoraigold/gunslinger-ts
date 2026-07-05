import { z } from 'zod';
import { Action } from '../Action';
import { Verdict } from '../Verdict';
import { defineActionOutcome } from '../ActionOutcome';
import { Context } from '../../context';
import { ItemType } from '../../state';
import { Schema, ZodSchema } from '../../../utils/schema';

const ItemTypeSchema = z.enum(['weapon', 'armor', 'consumable', 'key', 'lore', 'misc']) satisfies z.ZodType<ItemType>;
const ItemLocationSchema = z.enum(['inventory', 'room']);

const LookItemInputSchema = z.object({ itemId: z.string() });
const LookItemSuccessDataSchema = z.object({
    itemId: z.string(),
    name: z.string().describe('The name of the item'),
    description: z.string().describe('The description of the item'),
    type: ItemTypeSchema.describe('The kind of item'),
    location: ItemLocationSchema.describe('Where the item is relative to the player'),
    quantity: z.number().describe('How many of the item are present'),
});
const LookItemFailReasonSchema = z.enum(['item_not_present']);
const LookItemOutcomeSchema = defineActionOutcome(LookItemSuccessDataSchema, LookItemFailReasonSchema);

type LookItemInput = z.infer<typeof LookItemInputSchema>;
type LookItemOutcome = z.infer<typeof LookItemOutcomeSchema>;

export class LookItemAction implements Action<LookItemInput, LookItemOutcome> {
    readonly name = 'lookItem';
    readonly schema: Schema<LookItemInput> = new ZodSchema(LookItemInputSchema);
    readonly outcomeSchema = LookItemOutcomeSchema;

    execute(ctx: Context, input: LookItemInput): LookItemOutcome {
        const { itemId } = input;
        const carried = ctx.player().inventory().quantityOf(itemId);
        const onGround = ctx.requireCurrentRoom().inventory().quantityOf(itemId);
        const item = ctx.item(itemId);

        if (!item || (carried === 0 && onGround === 0)) {
            return Verdict.fail('item_not_present');
        }

        const inInventory = carried > 0;
        return Verdict.succeed({
            itemId,
            name: item.name,
            description: item.description,
            type: item.type,
            location: inInventory ? 'inventory' : 'room',
            quantity: inInventory ? carried : onGround,
        });
    }
}
