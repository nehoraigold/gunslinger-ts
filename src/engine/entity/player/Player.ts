import { RoomId } from '../../state';
import { Room } from '../room';
import { Inventory } from '../inventory';
import { Equipment } from '../equipment';
import { Wallet } from '../wallet';

export interface Player {
    currentRoomId: RoomId;
    moveTo(room: Room): void;
    inventory(): Inventory;
    equipment(): Equipment;
    wallet(): Wallet;
}
