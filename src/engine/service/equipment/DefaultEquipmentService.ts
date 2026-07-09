import { EquipSlot, ItemId } from '../../state';
import { Equipment, Inventory, equipSlotForItemType } from '../../entity';
import { ItemLookup } from '../inventory/ItemLookup';
import { EquipmentService } from './EquipmentService';
import { EquipOutcome, UnequipOutcome } from './EquipOutcome';

export class DefaultEquipmentService implements EquipmentService {
    constructor(private readonly items: ItemLookup) {}

    equip(itemId: ItemId, inventory: Inventory, equipment: Equipment): EquipOutcome {
        const slot = equipSlotForItemType(this.items.requireItem(itemId).type);
        if (!slot) {
            return { type: 'notEquippable' };
        }
        if (equipment.equippedIn(slot) === itemId) {
            return { type: 'alreadyEquipped' };
        }
        if (!inventory.has(itemId)) {
            return { type: 'notCarried' };
        }

        const displaced = equipment.equippedIn(slot);
        inventory.remove(itemId);
        equipment.equip(slot, itemId);
        if (displaced) {
            inventory.add(displaced);
        }
        return { type: 'equipped', itemId, slot, displaced };
    }

    unequip(slot: EquipSlot, inventory: Inventory, equipment: Equipment): UnequipOutcome {
        const itemId = equipment.equippedIn(slot);
        if (!itemId) {
            return { type: 'slotEmpty' };
        }

        equipment.unequip(slot);
        inventory.add(itemId);
        return { type: 'unequipped', itemId, slot };
    }
}
