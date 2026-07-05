import { ExitBlockReason, RoomId } from '../../state';

export interface Exit {
    destinationRoomId: RoomId;
    isBlocked(): boolean;
    blockReason(): ExitBlockReason | undefined;
}
