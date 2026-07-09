import { EquipSlot, ItemId } from '../../state';
import { Equipment, Inventory, equipSlotForItemType } from '../../entity';
import { ItemLookup } from '../inventory/ItemLookup';
import { EquipmentService } from './EquipmentService';
import { EquipOutcome, UnequipOutcome } from './EquipOutcome';

export class DefaultEquipmentService implements EquipmentService {
    constructor(
        private readonly items: ItemLookup,
        private readonly inventory: Inventory,
        private readonly equipment: Equipment,
    ) {}

    equip(itemId: ItemId): EquipOutcome {
        const slot = equipSlotForItemType(this.items.requireItem(itemId).type);
        if (!slot) {
            return { type: 'notEquippable' };
        }
        if (this.equipment.equippedIn(slot) === itemId) {
            return { type: 'alreadyEquipped' };
        }
        if (!this.inventory.has(itemId)) {
            return { type: 'notCarried' };
        }

        const displaced = this.equipment.equippedIn(slot);
        this.inventory.remove(itemId);
        this.equipment.equip(slot, itemId);
        if (displaced) {
            this.inventory.add(displaced);
        }
        return { type: 'equipped', itemId, slot, displaced };
    }

    unequip(slot: EquipSlot): UnequipOutcome {
        const itemId = this.equipment.equippedIn(slot);
        if (!itemId) {
            return { type: 'slotEmpty' };
        }

        this.equipment.unequip(slot);
        this.inventory.add(itemId);
        return { type: 'unequipped', itemId, slot };
    }
}
