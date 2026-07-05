import { z } from 'zod';
import { Action } from '../Action';
import { Verdict } from '../Verdict';
import { defineActionOutcome } from '../ActionOutcome';
import { Context } from '../../context';
import { InventoryService } from '../../service/inventory/InventoryService';
import { DefaultInventoryService } from '../../service/inventory/DefaultInventoryService';
import { assertNever } from '../../../utils/assertNever';
import { Schema, ZodSchema } from '../../../utils/schema';

const PickUpInputSchema = z.object({ itemId: z.string() });
const PickUpSuccessDataSchema = z.object({ itemId: z.string() });
const PickUpFailReasonSchema = z.enum(['not_in_room', 'cannot_carry_more']);
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
        const room = ctx.requireCurrentRoom();
        const result = this.createInventoryService(ctx).transfer(
            input.itemId,
            room.inventory(),
            ctx.player().inventory(),
        );
        switch (result.type) {
            case 'transferred':
                return Verdict.succeed({ itemId: result.itemId });
            case 'notAvailable':
                return Verdict.fail('not_in_room');
            case 'alreadyPresent':
                return Verdict.fail('cannot_carry_more');
            default:
                return assertNever(result);
        }
    }
}
