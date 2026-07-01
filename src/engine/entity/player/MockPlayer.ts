import { Player } from './Player';
import { RoomId } from '../../state';

export type MockPlayerOptions = {
    currentRoomId?: RoomId;
};

export class MockPlayer implements Player {
    currentRoomId: RoomId;

    constructor(opts?: MockPlayerOptions) {
        this.currentRoomId = opts?.currentRoomId ?? 'room_1';
    }

    moveTo(room: { id: string }): void {
        this.currentRoomId = room.id;
    }
}
