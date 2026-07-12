import { NpcId, RoomId } from '../../state';
import { Room } from '../room';
import { Npc } from '../npc';
import { Inventory } from '../inventory';
import { Equipment } from '../equipment';
import { Wallet } from '../wallet';
import { Health } from '../health';

export interface Player {
    currentRoomId: RoomId;
    conversationPartnerId: NpcId | undefined;
    moveTo(room: Room): void;
    converseWith(npc: Npc): void;
    endConversation(): void;
    inventory(): Inventory;
    equipment(): Equipment;
    wallet(): Wallet;
    health(): Health;
}
