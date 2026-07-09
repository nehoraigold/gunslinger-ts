import { EquipSlot, ItemId } from '../../state';
import { Equipment, Inventory } from '../../entity';
import { EquipOutcome, UnequipOutcome } from './EquipOutcome';

export interface EquipmentService {
    equip(itemId: ItemId, inventory: Inventory, equipment: Equipment): EquipOutcome;
    unequip(slot: EquipSlot, inventory: Inventory, equipment: Equipment): UnequipOutcome;
}
