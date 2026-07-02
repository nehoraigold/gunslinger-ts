import { Direction } from '../../state';
import { Context } from '../../context';
import { RoomNotFoundError } from './error/RoomNotFoundError';

export class MovementService {
    constructor(private readonly ctx: Context) {}

    move(direction: Direction) {
        const player = this.ctx.player();
        const room = this.ctx.room(player.currentRoomId);
        if (!room) {
            throw new RoomNotFoundError(player.currentRoomId);
        }
        const exit = room.getExit(direction);
        if (!exit || exit.isBlocked()) {
            return;
        }
        const destination = this.ctx.room(exit.destinationRoomId);
        if (!destination) {
            throw new RoomNotFoundError(exit.destinationRoomId);
        }
        player.moveTo(destination);
    }
}
