import { z } from 'zod';
import { Action } from '../Action';
import { ActionOutcome, defineActionOutcome } from '../ActionOutcome';
import { Context } from '../../context';
import { TradeService } from '../../service/trade/TradeService';
import { DefaultTradeService } from '../../service/trade/DefaultTradeService';
import { assertNever } from '../../../utils/assertNever';
import { Schema, ZodSchema } from '../../../utils/schema';

const SellInputSchema = z.object({
    npcId: z.string(),
    itemId: z.string(),
    quantity: z.number().int().positive().optional(),
});
const SellSuccessDataSchema = z.object({
    itemId: z.string(),
    quantity: z.number(),
    totalPrice: z.number(),
});
const SellFailReasonSchema = z.enum([
    'not_here',
    'not_a_merchant',
    'not_interested',
    'not_owned',
    'merchant_cannot_afford',
    'merchant_full',
]);
const SellOutcomeSchema = defineActionOutcome(SellSuccessDataSchema, SellFailReasonSchema);

type SellInput = z.infer<typeof SellInputSchema>;
type SellActionOutcome = z.infer<typeof SellOutcomeSchema>;

export class SellAction implements Action<SellInput, SellActionOutcome> {
    readonly name = 'sell';
    readonly schema: Schema<SellInput> = new ZodSchema(SellInputSchema);
    readonly outcomeSchema = SellOutcomeSchema;

    constructor(
        private readonly createTradeService: (ctx: Context) => TradeService = (ctx) => new DefaultTradeService(ctx),
    ) {}

    execute(ctx: Context, { npcId, itemId, quantity }: SellInput): SellActionOutcome {
        if (!ctx.requireCurrentRoom().npcIds().includes(npcId)) {
            return ActionOutcome.fail('not_here');
        }
        const shop = ctx.requireNpc(npcId).shop();
        if (!shop) {
            return ActionOutcome.fail('not_a_merchant');
        }

        const outcome = this.createTradeService(ctx).sell(itemId, shop, ctx.player(), quantity);
        switch (outcome.type) {
            case 'traded':
                return ActionOutcome.succeed({
                    itemId: outcome.itemId,
                    quantity: outcome.quantity,
                    totalPrice: outcome.totalPrice,
                });
            case 'notInterested':
                return ActionOutcome.fail('not_interested');
            case 'sellerHasNone':
                return ActionOutcome.fail('not_owned');
            case 'merchantCannotAfford':
                return ActionOutcome.fail('merchant_cannot_afford');
            case 'alreadyAtCapacity':
                return ActionOutcome.fail('merchant_full');
            default:
                return assertNever(outcome);
        }
    }
}
