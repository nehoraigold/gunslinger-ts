import { ItemId, ItemType } from '../../state';
import { Inventory } from '../inventory';
import { Wallet } from '../wallet';

export interface Shop {
    inventory(): Inventory;
    wallet(): Wallet;
    priceOf(itemId: ItemId): number | undefined;
    isForSale(itemId: ItemId): boolean;
    buys(itemType: ItemType): boolean;
}
