import { ItemId } from '../../state';

export type TradeSuccess = { type: 'traded'; itemId: ItemId; quantity: number; totalPrice: number };

export type BuyOutcome =
    | TradeSuccess
    | { type: 'notForSale' }
    | { type: 'outOfStock' }
    | { type: 'buyerCannotAfford' }
    | { type: 'alreadyAtCapacity' };

export type SellOutcome =
    | TradeSuccess
    | { type: 'notInterested' }
    | { type: 'sellerHasNone' }
    | { type: 'merchantCannotAfford' }
    | { type: 'alreadyAtCapacity' };
