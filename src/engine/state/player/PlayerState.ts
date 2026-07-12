import { EquipmentState } from './EquipmentState';
import { RoomId } from '../room';
import { InventoryState } from '../inventory';
import { NpcId } from '../npc';

export type PlayerState = {
    id: 'player';
    name: string;
    currentRoomId: RoomId;
    equipment: EquipmentState;
    inventory: InventoryState;
    money: number;
    conversationPartnerNpcId?: NpcId;
};
