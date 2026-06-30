import { EquipmentState } from './EquipmentState';
import { RoomId } from '../room';

export type PlayerState = {
    id: 'player';
    name: string;
    currentRoomId: RoomId;
    equipment: EquipmentState;
};
