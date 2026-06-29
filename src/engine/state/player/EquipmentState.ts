import { ItemId } from '../item';
import { EquipSlot } from './EquipSlot';

export type EquipmentState = Record<EquipSlot, ItemId | undefined>;
