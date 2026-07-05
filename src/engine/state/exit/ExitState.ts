import { Direction } from './Direction';
import { RoomId } from '../room';
import { LockState } from './LockState';

export type ExitState = {
    direction: Direction;
    destinationRoomId: RoomId;
    // A locked lock blocks passage; other barrier kinds (e.g. condition gates) would sit
    // alongside this as their own optional fields rather than a single typed `barrier`.
    lock?: LockState;
};
