import { RoomId } from '../../state';
import { Room } from '../room';

export interface Player {
    currentRoomId: RoomId;
    moveTo(room: Room): void;
}
