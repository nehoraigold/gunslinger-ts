import { RoomId } from '../../state';
import { Room } from '../room';
import { Inventory } from '../inventory';
import { Wallet } from '../wallet';

export interface Player {
    currentRoomId: RoomId;
    moveTo(room: Room): void;
    inventory(): Inventory;
    wallet(): Wallet;
}
