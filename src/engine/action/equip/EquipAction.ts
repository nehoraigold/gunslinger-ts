import { z } from 'zod';
import { Action } from '../Action';
import { ActionOutcome, defineActionOutcome } from '../ActionOutcome';
import { Context } from '../../context';
import { EquipmentService } from '../../service/equipment/EquipmentService';
import { DefaultEquipmentService } from '../../service/equipment/DefaultEquipmentService';
import { assertNever } from '../../../utils/assertNever';
import { Schema, ZodSchema } from '../../../utils/schema';

const EquipInputSchema = z.object({ itemId: z.string() });
const EquipSuccessDataSchema = z.object({
    itemId: z.string(),
    slot: z.enum(['weapon', 'armor']),
    displacedItemId: z.string().optional(),
});
const EquipFailReasonSchema = z.enum(['not_in_inventory', 'not_equippable', 'already_equipped']);
const EquipOutcomeSchema = defineActionOutcome(EquipSuccessDataSchema, EquipFailReasonSchema);

type EquipInput = z.infer<typeof EquipInputSchema>;
type EquipOutcome = z.infer<typeof EquipOutcomeSchema>;

export class EquipAction implements Action<EquipInput, EquipOutcome> {
    readonly name = 'equip';
    readonly schema: Schema<EquipInput> = new ZodSchema(EquipInputSchema);
    readonly outcomeSchema = EquipOutcomeSchema;

    constructor(
        private readonly createEquipmentService: (ctx: Context) => EquipmentService = (ctx) =>
            new DefaultEquipmentService(ctx, ctx.player().inventory(), ctx.player().equipment()),
    ) {}

    execute(ctx: Context, input: EquipInput): EquipOutcome {
        const result = this.createEquipmentService(ctx).equip(input.itemId);
        switch (result.type) {
            case 'equipped':
                return ActionOutcome.succeed({
                    itemId: result.itemId,
                    slot: result.slot,
                    displacedItemId: result.displaced,
                });
            case 'notEquippable':
                return ActionOutcome.fail('not_equippable');
            case 'notCarried':
                return ActionOutcome.fail('not_in_inventory');
            case 'alreadyEquipped':
                return ActionOutcome.fail('already_equipped');
            default:
                return assertNever(result);
        }
    }
}
