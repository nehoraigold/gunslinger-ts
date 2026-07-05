import { Direction, ExitBlockReason, RoomId } from '../../state';
import { Lock } from '../lock';

export interface Exit {
    readonly direction: Direction;
    destinationRoomId: RoomId;
    isBlocked(): boolean;
    blockReason(): ExitBlockReason | undefined;
    lock(): Lock | undefined;
}
