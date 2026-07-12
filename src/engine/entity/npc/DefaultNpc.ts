import { Npc } from './Npc';
import { NpcId, NpcMood, ShopState, InventoryState } from '../../state';
import { DerivedValueStore, NpcStore } from '../../store';
import { Wallet, DefaultWallet } from '../wallet';
import { Shop, DefaultShop } from '../shop';
import { Inventory, DefaultInventory } from '../inventory';

export class DefaultNpc implements Npc {
    constructor(
        public readonly id: NpcId,
        private readonly store: NpcStore,
    ) {}

    get name(): string {
        return this.store.get().name;
    }

    get appearance(): string {
        return this.store.get().appearance;
    }

    get dialogue(): string {
        return this.store.get().dialogue;
    }

    get mood(): NpcMood {
        return this.store.get().mood;
    }

    isAlive(): boolean {
        return this.store.get().health > 0;
    }

    wallet(): Wallet {
        return new DefaultWallet(
            () => this.store.get().money,
            (money) =>
                this.store.update((state) => {
                    state.money = money;
                }),
        );
    }

    shop(): Shop | undefined {
        if (!this.store.get().shop) {
            return undefined;
        }
        const shopStore = new DerivedValueStore<ShopState>(
            () => this.store.get().shop! as ShopState,
            (shop) =>
                this.store.update((state) => {
                    state.shop = shop;
                }),
        );
        return new DefaultShop(shopStore, this.wallet());
    }

    inventory(): Inventory {
        return new DefaultInventory(
            new DerivedValueStore<InventoryState>(
                () => this.store.get().inventory,
                (inventory) =>
                    this.store.update((state) => {
                        state.inventory = inventory;
                    }),
            ),
        );
    }
}
