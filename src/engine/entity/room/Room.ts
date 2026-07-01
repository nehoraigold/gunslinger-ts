import { Direction, ExitState, RoomId } from '../../state';

export interface Room {
    id: RoomId;
    getExit(direction: Direction): Readonly<ExitState> | undefined;
}
