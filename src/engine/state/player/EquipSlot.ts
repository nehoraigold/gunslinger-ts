export const EQUIP_SLOTS = ['weapon', 'armor'] as const;
export type EquipSlot = (typeof EQUIP_SLOTS)[number];
