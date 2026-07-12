import { z } from 'zod';
import { Action } from '../Action';
import { ActionOutcome, defineActionOutcome } from '../ActionOutcome';
import { Context } from '../../context';
import { InventoryService } from '../../service/inventory/InventoryService';
import { DefaultInventoryService } from '../../service/inventory/DefaultInventoryService';
import { assertNever } from '../../../utils/assertNever';
import { Schema, ZodSchema } from '../../../utils/schema';

const GiveInputSchema = z.object({
    npcId: z.string(),
    itemId: z.string(),
    quantity: z.number().int().positive().optional(),
});
const GiveSuccessDataSchema = z.object({
    itemId: z.string(),
    quantity: z.number(),
});
const GiveFailReasonSchema = z.enum(['not_here', 'not_carrying', 'not_enough_carried', 'npc_cannot_receive']);
const GiveOutcomeSchema = defineActionOutcome(GiveSuccessDataSchema, GiveFailReasonSchema);

type GiveInput = z.infer<typeof GiveInputSchema>;
type GiveOutcome = z.infer<typeof GiveOutcomeSchema>;

export class GiveAction implements Action<GiveInput, GiveOutcome> {
    readonly name = 'give';
    readonly schema: Schema<GiveInput> = new ZodSchema(GiveInputSchema);
    readonly outcomeSchema = GiveOutcomeSchema;

    constructor(
        private readonly createInventoryService: (ctx: Context) => InventoryService = (ctx) =>
            new DefaultInventoryService(ctx),
    ) {}

    execute(ctx: Context, { npcId, itemId, quantity }: GiveInput): GiveOutcome {
        if (!ctx.requireCurrentRoom().npcIds().includes(npcId)) {
            return ActionOutcome.fail('not_here');
        }
        const npc = ctx.requireNpc(npcId);
        const result = this.createInventoryService(ctx).transfer(
            itemId,
            ctx.player().inventory(),
            npc.inventory(),
            quantity,
        );
        switch (result.type) {
            case 'transferred':
                return ActionOutcome.succeed({ itemId: result.itemId, quantity: result.quantity });
            case 'notAvailable':
                return ActionOutcome.fail('not_carrying');
            case 'insufficientQuantity':
                return ActionOutcome.fail('not_enough_carried');
            case 'maximumQuantityReached':
                return ActionOutcome.fail('npc_cannot_receive');
            default:
                return assertNever(result);
        }
    }
}
