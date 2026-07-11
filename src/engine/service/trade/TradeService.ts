import { ItemId } from '../../state';
import { Player, Shop } from '../../entity';
import { BuyOutcome, SellOutcome } from './TradeOutcome';

export interface TradeService {
    buy(itemId: ItemId, shop: Shop, buyer: Player, quantity?: number): BuyOutcome;
    sell(itemId: ItemId, shop: Shop, seller: Player, quantity?: number): SellOutcome;
}
