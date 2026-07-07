import { z } from 'zod';
import { Action } from '../Action';
import { Verdict } from '../Verdict';
import { defineActionOutcome } from '../ActionOutcome';
import { Context } from '../../context';
import { Schema, ZodSchema } from '../../../utils/schema';

const TalkToInputSchema = z.object({ npcId: z.string() });
const TalkToSuccessDataSchema = z.object({
    npcId: z.string(),
    name: z.string().describe('The name of the npc'),
    dialogue: z.string().describe('The line the npc says'),
});
const TalkToFailReasonSchema = z.enum(['npc_not_present']);
const TalkToOutcomeSchema = defineActionOutcome(TalkToSuccessDataSchema, TalkToFailReasonSchema);

type TalkToInput = z.infer<typeof TalkToInputSchema>;
type TalkToOutcome = z.infer<typeof TalkToOutcomeSchema>;

export class TalkToAction implements Action<TalkToInput, TalkToOutcome> {
    readonly name = 'talkTo';
    readonly schema: Schema<TalkToInput> = new ZodSchema(TalkToInputSchema);
    readonly outcomeSchema = TalkToOutcomeSchema;

    execute(ctx: Context, { npcId }: TalkToInput): TalkToOutcome {
        if (!ctx.requireCurrentRoom().npcIds().includes(npcId)) {
            return Verdict.fail('npc_not_present');
        }

        const npc = ctx.requireNpc(npcId);
        ctx.flags().set(`talked_to_${npcId}`, true);
        return Verdict.succeed({
            npcId,
            name: npc.name,
            dialogue: npc.dialogue,
        });
    }
}
