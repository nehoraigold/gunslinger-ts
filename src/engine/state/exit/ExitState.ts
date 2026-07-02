import { Direction } from './Direction';
import { RoomId } from '../room';
import { ExitBlockReason } from './ExitBlockReason';

type UnblockedExit = { isBlocked?: false; blockReason?: never };
type BlockedExit = { isBlocked?: true; blockReason: ExitBlockReason };

export type ExitState = {
    direction: Direction;
    destinationRoomId: RoomId;
} & (UnblockedExit | BlockedExit);
