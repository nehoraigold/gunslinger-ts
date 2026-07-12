import { Room } from '../room';
import { Inventory, DefaultInventory } from '../inventory';
import { Equipment, DefaultEquipment } from '../equipment';
import { Wallet, DefaultWallet } from '../wallet';
import { DerivedValueStore, PlayerStore } from '../../store';
import { EquipmentState, InventoryState, NpcId, RoomId } from '../../state';
import { Player } from './Player';

export class DefaultPlayer implements Player {
    constructor(private readonly store: PlayerStore) {}

    get currentRoomId(): RoomId {
        return this.store.get().currentRoomId;
    }

    get conversationPartnerId(): NpcId | undefined {
        return this.store.get().conversationPartnerNpcId;
    }

    moveTo(room: Room): void {
        this.store.update((state) => {
            state.currentRoomId = room.id;
        });
    }

    startConversation(npcId: NpcId): void {
        this.store.update((state) => {
            state.conversationPartnerNpcId = npcId;
        });
    }

    endConversation(): void {
        this.store.update((state) => {
            state.conversationPartnerNpcId = undefined;
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

    equipment(): Equipment {
        return new DefaultEquipment(
            new DerivedValueStore<EquipmentState>(
                () => this.store.get().equipment,
                (equipment) =>
                    this.store.update((state) => {
                        state.equipment = equipment;
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
