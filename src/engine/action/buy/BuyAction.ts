import { z } from 'zod';
import { Action } from '../Action';
import { ActionOutcome, defineActionOutcome } from '../ActionOutcome';
import { Context } from '../../context';
import { TradeService } from '../../service/trade/TradeService';
import { DefaultTradeService } from '../../service/trade/DefaultTradeService';
import { assertNever } from '../../../utils/assertNever';
import { Schema, ZodSchema } from '../../../utils/schema';

const BuyInputSchema = z.object({
    npcId: z.string(),
    itemId: z.string(),
    quantity: z.number().int().positive().optional(),
});
const BuySuccessDataSchema = z.object({
    itemId: z.string(),
    quantity: z.number(),
    totalPrice: z.number(),
});
const BuyFailReasonSchema = z.enum([
    'not_here',
    'not_a_merchant',
    'not_for_sale',
    'out_of_stock',
    'cannot_afford',
    'cannot_carry',
]);
const BuyOutcomeSchema = defineActionOutcome(BuySuccessDataSchema, BuyFailReasonSchema);

type BuyInput = z.infer<typeof BuyInputSchema>;
type BuyActionOutcome = z.infer<typeof BuyOutcomeSchema>;

export class BuyAction implements Action<BuyInput, BuyActionOutcome> {
    readonly name = 'buy';
    readonly schema: Schema<BuyInput> = new ZodSchema(BuyInputSchema);
    readonly outcomeSchema = BuyOutcomeSchema;

    constructor(
        private readonly createTradeService: (ctx: Context) => TradeService = (ctx) => new DefaultTradeService(ctx),
    ) {}

    execute(ctx: Context, { npcId, itemId, quantity }: BuyInput): BuyActionOutcome {
        if (!ctx.requireCurrentRoom().npcIds().includes(npcId)) {
            return ActionOutcome.fail('not_here');
        }
        const shop = ctx.requireNpc(npcId).shop();
        if (!shop) {
            return ActionOutcome.fail('not_a_merchant');
        }

        const outcome = this.createTradeService(ctx).buy(itemId, shop, ctx.player(), quantity);
        switch (outcome.type) {
            case 'traded':
                return ActionOutcome.succeed({
                    itemId: outcome.itemId,
                    quantity: outcome.quantity,
                    totalPrice: outcome.totalPrice,
                });
            case 'notForSale':
                return ActionOutcome.fail('not_for_sale');
            case 'outOfStock':
                return ActionOutcome.fail('out_of_stock');
            case 'buyerCannotAfford':
                return ActionOutcome.fail('cannot_afford');
            case 'alreadyAtCapacity':
                return ActionOutcome.fail('cannot_carry');
            default:
                return assertNever(outcome);
        }
    }
}
