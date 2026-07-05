import { ExitBlockReason, RoomId } from '../../state';
import { Lock } from '../lock';

export interface Exit {
    destinationRoomId: RoomId;
    isBlocked(): boolean;
    blockReason(): ExitBlockReason | undefined;
    lock(): Lock | undefined;
}
