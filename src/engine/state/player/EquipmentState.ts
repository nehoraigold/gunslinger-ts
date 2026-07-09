import { ItemId } from '../item';
import { EquipSlot } from './EquipSlot';

export type EquipmentState = Partial<Record<EquipSlot, ItemId>>;
