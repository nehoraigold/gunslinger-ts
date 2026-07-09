import { EquipSlot, ItemId } from '../../state';
import { EquipOutcome, UnequipOutcome } from './EquipOutcome';

export interface EquipmentService {
    equip(itemId: ItemId): EquipOutcome;
    unequip(slot: EquipSlot): UnequipOutcome;
}
