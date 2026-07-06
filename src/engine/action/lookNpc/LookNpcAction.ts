import { z } from 'zod';
import { Action } from '../Action';
import { Verdict } from '../Verdict';
import { defineActionOutcome } from '../ActionOutcome';
import { Context } from '../../context';
import { Schema, ZodSchema } from '../../../utils/schema';

const LookNpcInputSchema = z.object({ npcId: z.string() });
const LookNpcSuccessDataSchema = z.object({
    npcId: z.string(),
    name: z.string().describe('The name of the npc'),
    appearance: z.string().describe('How the npc looks'),
});
const LookNpcFailReasonSchema = z.enum(['npc_not_present']);
const LookNpcOutcomeSchema = defineActionOutcome(LookNpcSuccessDataSchema, LookNpcFailReasonSchema);

type LookNpcInput = z.infer<typeof LookNpcInputSchema>;
type LookNpcOutcome = z.infer<typeof LookNpcOutcomeSchema>;

export class LookNpcAction implements Action<LookNpcInput, LookNpcOutcome> {
    readonly name = 'lookNpc';
    readonly schema: Schema<LookNpcInput> = new ZodSchema(LookNpcInputSchema);
    readonly outcomeSchema = LookNpcOutcomeSchema;

    execute(ctx: Context, { npcId }: LookNpcInput): LookNpcOutcome {
        if (!ctx.requireCurrentRoom().npcIds().includes(npcId)) {
            return Verdict.fail('npc_not_present');
        }

        const npc = ctx.requireNpc(npcId);
        return Verdict.succeed({
            npcId,
            name: npc.name,
            appearance: npc.appearance,
        });
    }
}
