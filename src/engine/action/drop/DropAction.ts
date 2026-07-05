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
const DropFailReasonSchema = z.enum(['not_in_inventory', 'item_already_here']);
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
        const room = ctx.requireCurrentRoom();
        const result = this.createInventoryService(ctx).transfer(
            input.itemId,
            ctx.player().inventory(),
            room.inventory(),
        );
        switch (result.type) {
            case 'transferred':
                return Verdict.succeed({ itemId: result.itemId });
            case 'notAvailable':
                return Verdict.fail('not_in_inventory');
            case 'alreadyPresent':
                return Verdict.fail('item_already_here');
            default:
                return assertNever(result);
        }
    }
}
