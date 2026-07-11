import { ItemId } from '../../state';
import { Player, Shop } from '../../entity';
import { assertNever } from '../../../utils/assertNever';
import { InventoryService } from '../inventory';
import { DefaultInventoryService } from '../inventory';
import { ItemLookup } from '../inventory';
import { TradeService } from './TradeService';
import { BuyOutcome, SellOutcome } from './TradeOutcome';

export class DefaultTradeService implements TradeService {
    private readonly inventory: InventoryService;

    constructor(private readonly items: ItemLookup) {
        this.inventory = new DefaultInventoryService(items);
    }

    buy(itemId: ItemId, shop: Shop, buyer: Player, quantity = 1): BuyOutcome {
        if (!shop.sells(itemId)) {
            return { type: 'notForSale' };
        }
        const unitPrice = shop.priceOf(itemId);
        if (unitPrice === undefined) {
            return { type: 'notForSale' };
        }
        if (!this.items.requireItem(itemId).stackable && quantity > 1) {
            return { type: 'alreadyAtCapacity' };
        }
        const totalPrice = unitPrice * quantity;
        if (!buyer.wallet().canAfford(totalPrice)) {
            return { type: 'buyerCannotAfford' };
        }

        const transfer = this.inventory.transfer(itemId, shop.inventory(), buyer.inventory(), quantity);
        switch (transfer.type) {
            case 'transferred':
                buyer.wallet().debit(totalPrice);
                shop.wallet().credit(totalPrice);
                return { type: 'traded', itemId, quantity, totalPrice };
            case 'notAvailable':
            case 'insufficientQuantity':
                return { type: 'outOfStock' };
            case 'maximumQuantityReached':
                return { type: 'alreadyAtCapacity' };
            default:
                return assertNever(transfer);
        }
    }

    sell(itemId: ItemId, shop: Shop, seller: Player, quantity = 1): SellOutcome {
        const item = this.items.requireItem(itemId);
        if (!shop.buys(item.type)) {
            return { type: 'notInterested' };
        }
        const totalPrice = item.value * quantity;
        if (!shop.wallet().canAfford(totalPrice)) {
            return { type: 'merchantCannotAfford' };
        }

        const transfer = this.inventory.transfer(itemId, seller.inventory(), shop.inventory(), quantity);
        switch (transfer.type) {
            case 'transferred':
                shop.wallet().debit(totalPrice);
                seller.wallet().credit(totalPrice);
                return { type: 'traded', itemId, quantity, totalPrice };
            case 'notAvailable':
            case 'insufficientQuantity':
                return { type: 'sellerHasNone' };
            case 'maximumQuantityReached':
                return { type: 'alreadyAtCapacity' };
            default:
                return assertNever(transfer);
        }
    }
}
