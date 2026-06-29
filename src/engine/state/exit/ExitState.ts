import { Direction } from './Direction';
import { RoomId } from '../room/RoomId';

export type ExitState = {
    direction: Direction;
    destinationRoomId: RoomId;
};
