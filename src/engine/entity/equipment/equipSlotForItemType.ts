import { EquipSlot, ItemType } from '../../state';

export function equipSlotForItemType(type: ItemType): EquipSlot | undefined {
    switch (type) {
        case 'weapon':
            return 'weapon';
        case 'armor':
            return 'armor';
        default:
            return undefined;
    }
}
