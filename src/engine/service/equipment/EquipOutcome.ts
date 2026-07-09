import { EquipSlot, ItemId } from '../../state';

export type EquipOutcome =
    | { type: 'equipped'; itemId: ItemId; slot: EquipSlot; displaced?: ItemId }
    | { type: 'notEquippable' }
    | { type: 'notCarried' }
    | { type: 'alreadyEquipped' };

export type UnequipOutcome = { type: 'unequipped'; itemId: ItemId; slot: EquipSlot } | { type: 'slotEmpty' };
