import { Room } from '../room';
import { Inventory, DefaultInventory } from '../inventory';
import { Wallet, DefaultWallet } from '../wallet';
import { DerivedValueStore, PlayerStore } from '../../store';
import { InventoryState, RoomId } from '../../state';
import { Player } from './Player';

export class DefaultPlayer implements Player {
    constructor(private readonly store: PlayerStore) {}

    get currentRoomId(): RoomId {
        return this.store.get().currentRoomId;
    }

    moveTo(room: Room): void {
        this.store.update((state) => {
            state.currentRoomId = room.id;
        });
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

    wallet(): Wallet {
        return new DefaultWallet(
            () => this.store.get().money,
            (money) =>
                this.store.update((state) => {
                    state.money = money;
                }),
        );
    }
}
