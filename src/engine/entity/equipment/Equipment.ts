import { EquipSlot, ItemId } from '../../state';

export interface Equipment {
    equippedIn(slot: EquipSlot): ItemId | undefined;
    equip(slot: EquipSlot, itemId: ItemId): void;
    unequip(slot: EquipSlot): void;
}
