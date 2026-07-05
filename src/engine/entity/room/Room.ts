import { Direction, RoomId } from '../../state';
import { Exit } from '../exit';
import { Inventory } from '../inventory';

export interface Room {
    id: RoomId;
    getExit(direction: Direction): Exit | undefined;
    inventory(): Inventory;
}
