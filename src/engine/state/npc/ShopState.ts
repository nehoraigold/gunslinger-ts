import { InventoryState } from '../inventory';
import { ItemId, ItemType } from '../item';

export type ShopListing = {
    price: number;
    forSale: boolean;
};

export type ShopState = {
    inventory: InventoryState;
    listings: Record<ItemId, ShopListing>;
    buys: ItemType[];
};
