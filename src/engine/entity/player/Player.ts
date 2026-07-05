import { RoomId } from '../../state';
import { Room } from '../room';
import { Inventory } from '../inventory';

export interface Player {
    currentRoomId: RoomId;
    moveTo(room: Room): void;
    inventory(): Inventory;
}
