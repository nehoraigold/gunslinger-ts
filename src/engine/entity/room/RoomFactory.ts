import { RoomId } from '../../state';
import { RoomStore } from '../../store';
import { Room } from './Room';

export interface RoomFactory {
    create(id: RoomId, store: RoomStore): Room;
}
