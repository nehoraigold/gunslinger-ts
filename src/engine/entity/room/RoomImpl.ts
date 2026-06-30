import { Room } from './Room';
import { RoomId } from '../../state/room';
import { RoomStore } from '../../store';

export class RoomImpl implements Room {
    constructor(
        public readonly id: RoomId,
        private readonly store: RoomStore,
    ) {}
}
