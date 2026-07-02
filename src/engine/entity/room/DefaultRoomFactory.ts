import { RoomFactory } from './RoomFactory';
import { RoomId } from '../../state';
import { RoomStore } from '../../store';
import { DefaultRoom } from './DefaultRoom';
import { Room } from './Room';

export class DefaultRoomFactory implements RoomFactory {
    create(id: RoomId, store: RoomStore): Room {
        return new DefaultRoom(id, store);
    }
}
