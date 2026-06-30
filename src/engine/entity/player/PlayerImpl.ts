import { Room } from '../room';
import { PlayerStore } from '../../store';
import { Player } from './Player';
import { RoomId } from '../../state/room';

export class PlayerImpl implements Player {
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
