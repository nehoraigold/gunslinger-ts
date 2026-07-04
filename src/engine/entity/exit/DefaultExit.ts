import { Exit } from './Exit';
import { RoomStore } from '../../store';
import { ExitState, RoomId } from '../../state';

export class DefaultExit implements Exit {
    constructor(
        private cachedState: ExitState,
        private readonly roomStore: RoomStore,
    ) {}

    get destinationRoomId(): RoomId {
        return this.cachedState.destinationRoomId;
    }

    isBlocked(): boolean {
        return !!this.cachedState.isBlocked;
    }
}
