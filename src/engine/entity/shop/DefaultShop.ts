import { Shop } from './Shop';
import { ItemId, ItemType, ShopState } from '../../state';
import { DerivedValueStore, ValueStore } from '../../store';
import { Inventory, DefaultInventory } from '../inventory';
import { Wallet } from '../wallet';

export class DefaultShop implements Shop {
    constructor(
        private readonly store: ValueStore<ShopState>,
        private readonly purse: Wallet,
    ) {}

    inventory(): Inventory {
        return new DefaultInventory(
            new DerivedValueStore(
                () => this.store.get().inventory,
                (inventory) =>
                    this.store.update((state) => {
                        state.inventory = inventory;
                    }),
            ),
        );
    }

    wallet(): Wallet {
        return this.purse;
    }

    priceOf(itemId: ItemId): number | undefined {
        return this.store.get().listings[itemId]?.price;
    }

    sells(itemId: ItemId): boolean {
        return this.store.get().listings[itemId]?.forSale ?? false;
    }

    buys(itemType: ItemType): boolean {
        return this.store.get().buys.includes(itemType);
    }
}
