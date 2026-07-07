import { z } from 'zod';
import { Action } from '../Action';
import { Verdict } from '../Verdict';
import { defineActionOutcome } from '../ActionOutcome';
import { Context } from '../../context';
import { InventoryService } from '../../service/inventory/InventoryService';
import { DefaultInventoryService } from '../../service/inventory/DefaultInventoryService';
import { assertNever } from '../../../utils/assertNever';
import { Schema, ZodSchema } from '../../../utils/schema';

const DropInputSchema = z.object({ itemId: z.string() });
const DropSuccessDataSchema = z.object({ itemId: z.string() });
const DropFailReasonSchema = z.enum([
    'not_droppable',
    'not_in_inventory',
    'not_enough_in_inventory',
    'item_already_here',
]);
const DropOutcomeSchema = defineActionOutcome(DropSuccessDataSchema, DropFailReasonSchema);

type DropInput = z.infer<typeof DropInputSchema>;
type DropOutcome = z.infer<typeof DropOutcomeSchema>;

export class DropAction implements Action<DropInput, DropOutcome> {
    readonly name = 'drop';
    readonly schema: Schema<DropInput> = new ZodSchema(DropInputSchema);
    readonly outcomeSchema = DropOutcomeSchema;

    constructor(
        private readonly createInventoryService: (ctx: Context) => InventoryService = (ctx) =>
            new DefaultInventoryService(ctx),
    ) {}

    execute(ctx: Context, input: DropInput): DropOutcome {
        const item = ctx.requireItem(input.itemId);
        const playerInventory = ctx.player().inventory();
        if (!playerInventory.has(input.itemId)) {
            return Verdict.fail('not_in_inventory');
        }
        if (!item.droppable) {
            return Verdict.fail('not_droppable');
        }
        const result = this.createInventoryService(ctx).transfer(
            input.itemId,
            playerInventory,
            ctx.requireCurrentRoom().inventory(),
        );
        switch (result.type) {
            case 'transferred':
                return Verdict.succeed({ itemId: result.itemId });
            case 'notAvailable':
                return Verdict.fail('not_in_inventory');
            case 'insufficientQuantity':
                return Verdict.fail('not_enough_in_inventory');
            case 'maximumQuantityReached':
                return Verdict.fail('item_already_here');
            default:
                return assertNever(result);
        }
    }
}
