import { NpcId, RoomId } from '../../state';
import { Room } from '../room';
import { Inventory } from '../inventory';
import { Equipment } from '../equipment';
import { Wallet } from '../wallet';

export interface Player {
    currentRoomId: RoomId;
    conversationPartnerId: NpcId | undefined;
    moveTo(room: Room): void;
    startConversation(npcId: NpcId): void;
    endConversation(): void;
    inventory(): Inventory;
    equipment(): Equipment;
    wallet(): Wallet;
}
