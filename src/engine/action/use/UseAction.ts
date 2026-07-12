import { z } from 'zod';
import { Action } from '../Action';
import { ActionOutcome, defineActionOutcome } from '../ActionOutcome';
import { Context } from '../../context';
import { UseItemService } from '../../service/useItem/UseItemService';
import { DefaultUseItemService } from '../../service/useItem/DefaultUseItemService';
import { assertNever } from '../../../utils/assertNever';
import { Schema, ZodSchema } from '../../../utils/schema';

const UseInputSchema = z.object({ itemId: z.string() });
const ItemEffectDataSchema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('heal'), amount: z.number() }),
    z.object({ type: z.literal('damage'), amount: z.number() }),
    z.object({ type: z.literal('unlock'), flagKey: z.string() }),
    z.object({ type: z.literal('revealItem'), itemId: z.string() }),
    z.object({ type: z.literal('revealLore'), text: z.string() }),
]);
const UseSuccessDataSchema = z.object({
    itemId: z.string(),
    effect: ItemEffectDataSchema,
    consumed: z.boolean(),
});
const UseFailReasonSchema = z.enum(['not_carrying', 'not_usable']);
const UseOutcomeSchema = defineActionOutcome(UseSuccessDataSchema, UseFailReasonSchema);

type UseInput = z.infer<typeof UseInputSchema>;
type UseOutcome = z.infer<typeof UseOutcomeSchema>;

export class UseAction implements Action<UseInput, UseOutcome> {
    readonly name = 'use';
    readonly schema: Schema<UseInput> = new ZodSchema(UseInputSchema);
    readonly outcomeSchema = UseOutcomeSchema;

    constructor(
        private readonly createUseItemService: (ctx: Context) => UseItemService = (ctx) =>
            new DefaultUseItemService(ctx),
    ) {}

    execute(ctx: Context, { itemId }: UseInput): UseOutcome {
        const item = ctx.requireItem(itemId);
        const result = this.createUseItemService(ctx).use(itemId, item, ctx.player());
        switch (result.type) {
            case 'used':
                return ActionOutcome.succeed({ itemId, effect: result.effect, consumed: item.consumedOnUse });
            case 'notCarried':
                return ActionOutcome.fail('not_carrying');
            case 'notUsable':
                return ActionOutcome.fail('not_usable');
            default:
                return assertNever(result);
        }
    }
}
