import { Direction, RoomId } from '../../state';
import { Exit } from '../exit';

export interface Room {
    id: RoomId;
    getExit(direction: Direction): Exit | undefined;
}
