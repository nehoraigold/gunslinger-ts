import { z } from 'zod';
import { Action } from '../Action';
import { ActionOutcome, defineActionOutcome } from '../ActionOutcome';
import { Context } from '../../context';
import { InventoryService } from '../../service/inventory/InventoryService';
import { DefaultInventoryService } from '../../service/inventory/DefaultInventoryService';
import { assertNever } from '../../../utils/assertNever';
import { Schema, ZodSchema } from '../../../utils/schema';

const PickUpInputSchema = z.object({ itemId: z.string() });
const PickUpSuccessDataSchema = z.object({ itemId: z.string() });
const PickUpFailReasonSchema = z.enum(['not_takeable', 'not_in_room', 'not_enough_in_room', 'already_carrying']);
const PickUpOutcomeSchema = defineActionOutcome(PickUpSuccessDataSchema, PickUpFailReasonSchema);

type PickUpInput = z.infer<typeof PickUpInputSchema>;
type PickUpOutcome = z.infer<typeof PickUpOutcomeSchema>;

export class PickUpAction implements Action<PickUpInput, PickUpOutcome> {
    readonly name = 'pickUp';
    readonly schema: Schema<PickUpInput> = new ZodSchema(PickUpInputSchema);
    readonly outcomeSchema = PickUpOutcomeSchema;

    constructor(
        private readonly createInventoryService: (ctx: Context) => InventoryService = (ctx) =>
            new DefaultInventoryService(ctx),
    ) {}

    execute(ctx: Context, input: PickUpInput): PickUpOutcome {
        const item = ctx.requireItem(input.itemId);
        const roomInventory = ctx.requireCurrentRoom().inventory();
        if (!roomInventory.has(input.itemId)) {
            return ActionOutcome.fail('not_in_room');
        }
        if (!item.takeable) {
            return ActionOutcome.fail('not_takeable');
        }
        const result = this.createInventoryService(ctx).transfer(input.itemId, roomInventory, ctx.player().inventory());
        switch (result.type) {
            case 'transferred':
                return ActionOutcome.succeed({ itemId: result.itemId });
            case 'notAvailable':
                return ActionOutcome.fail('not_in_room');
            case 'insufficientQuantity':
                return ActionOutcome.fail('not_enough_in_room');
            case 'maximumQuantityReached':
                return ActionOutcome.fail('already_carrying');
            default:
                return assertNever(result);
        }
    }
}
