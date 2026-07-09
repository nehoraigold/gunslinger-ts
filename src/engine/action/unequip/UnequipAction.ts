import { z } from 'zod';
import { Action } from '../Action';
import { ActionOutcome, defineActionOutcome } from '../ActionOutcome';
import { Context } from '../../context';
import { EquipmentService } from '../../service/equipment/EquipmentService';
import { DefaultEquipmentService } from '../../service/equipment/DefaultEquipmentService';
import { assertNever } from '../../../utils/assertNever';
import { Schema, ZodSchema } from '../../../utils/schema';

const UnequipInputSchema = z.object({ slot: z.enum(['weapon', 'armor']) });
const UnequipSuccessDataSchema = z.object({ itemId: z.string(), slot: z.enum(['weapon', 'armor']) });
const UnequipFailReasonSchema = z.enum(['slot_empty']);
const UnequipOutcomeSchema = defineActionOutcome(UnequipSuccessDataSchema, UnequipFailReasonSchema);

type UnequipInput = z.infer<typeof UnequipInputSchema>;
type UnequipOutcome = z.infer<typeof UnequipOutcomeSchema>;

export class UnequipAction implements Action<UnequipInput, UnequipOutcome> {
    readonly name = 'unequip';
    readonly schema: Schema<UnequipInput> = new ZodSchema(UnequipInputSchema);
    readonly outcomeSchema = UnequipOutcomeSchema;

    constructor(
        private readonly createEquipmentService: (ctx: Context) => EquipmentService = (ctx) =>
            new DefaultEquipmentService(ctx, ctx.player().inventory(), ctx.player().equipment()),
    ) {}

    execute(ctx: Context, input: UnequipInput): UnequipOutcome {
        const result = this.createEquipmentService(ctx).unequip(input.slot);
        switch (result.type) {
            case 'unequipped':
                return ActionOutcome.succeed({ itemId: result.itemId, slot: result.slot });
            case 'slotEmpty':
                return ActionOutcome.fail('slot_empty');
            default:
                return assertNever(result);
        }
    }
}
