import { Equipment } from './Equipment';
import { EquipSlot, ItemId } from '../../state';
import { EquipmentStore } from '../../store';

export class DefaultEquipment implements Equipment {
    constructor(private readonly store: EquipmentStore) {}

    equippedIn(slot: EquipSlot): ItemId | undefined {
        return this.store.get()[slot];
    }

    equip(slot: EquipSlot, itemId: ItemId): void {
        this.store.update((draft) => {
            draft[slot] = itemId;
        });
    }

    unequip(slot: EquipSlot): void {
        this.store.update((draft) => {
            delete draft[slot];
        });
    }
}
