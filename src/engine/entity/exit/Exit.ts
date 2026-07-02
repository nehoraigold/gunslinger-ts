import { RoomId } from '../../state';

export interface Exit {
    destinationRoomId: RoomId;
    isBlocked(): boolean;
}
