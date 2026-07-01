import { Room } from '../room';
import { PlayerStore } from '../../store';
import { RoomId } from '../../state';
import { Player } from './Player';

export class DefaultPlayer implements Player {
    constructor(private readonly store: PlayerStore) {}

    get currentRoomId(): RoomId {
        return this.store.get().currentRoomId;
    }

    moveTo(room: Room): void {
        this.store.update((state) => {
            state.currentRoomId = room.id;
        });
    }
}
