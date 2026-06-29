import { EquipmentState } from './EquipmentState';

export type PlayerState = {
    id: 'player';
    name: string;
    currentRoomId: string;
    equipment: EquipmentState;
};
