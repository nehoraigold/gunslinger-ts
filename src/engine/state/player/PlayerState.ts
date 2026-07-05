import { EquipmentState } from './EquipmentState';
import { RoomId } from '../room';
import { InventoryState } from '../inventory';

export type PlayerState = {
    id: 'player';
    name: string;
    currentRoomId: RoomId;
    equipment: EquipmentState;
    inventory: InventoryState;
};
