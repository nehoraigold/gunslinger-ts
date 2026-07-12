import { z } from 'zod';
import { Action } from '../Action';
import { ActionOutcome, defineActionOutcome } from '../ActionOutcome';
import { Context } from '../../context';
import { deriveHealthProse } from '../../entity';
import { Schema, ZodSchema } from '../../../utils/schema';

const CheckStatusInputSchema = z.void();
const CheckStatusSuccessDataSchema = z.object({
    health: z.enum(['healthy', 'bruised', 'wounded', 'battered', 'fatal']),
});
const CheckStatusFailReasonSchema = z.never();
const CheckStatusOutcomeSchema = defineActionOutcome(CheckStatusSuccessDataSchema, CheckStatusFailReasonSchema);

type CheckStatusInput = z.infer<typeof CheckStatusInputSchema>;
type CheckStatusOutcome = z.infer<typeof CheckStatusOutcomeSchema>;

export class CheckStatusAction implements Action<CheckStatusInput, CheckStatusOutcome> {
    readonly name = 'checkStatus';
    readonly schema: Schema<CheckStatusInput> = new ZodSchema(CheckStatusInputSchema);
    readonly outcomeSchema = CheckStatusOutcomeSchema;

    execute(ctx: Context): CheckStatusOutcome {
        const vitals = ctx.player().vitals();
        return ActionOutcome.succeed({
            health: deriveHealthProse(vitals.current(), vitals.max()),
        });
    }
}
