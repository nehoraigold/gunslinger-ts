import { RoomId } from '../../../state';

export class RoomNotFoundError extends Error {
    constructor(roomId: RoomId) {
        super(`No room with ID "${roomId}"`);
        this.name = 'RoomNotFoundError';
    }
}
