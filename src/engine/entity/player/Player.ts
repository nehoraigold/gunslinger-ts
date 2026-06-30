import { RoomId } from '../../state/room';
import { Room } from '../room';

export interface Player {
    currentRoomId: RoomId;
    moveTo(room: Room): void;
}
