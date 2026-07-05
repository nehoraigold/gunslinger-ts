import { Direction } from '../../state';
import { Context } from '../../context';
import { RoomNotFoundError } from '../../error';
import { MovementOutcome } from './MovementOutcome';
import { MovementService } from './MovementService';

export class DefaultMovementService implements MovementService {
    constructor(private readonly ctx: Context) {}

    move(direction: Direction): MovementOutcome {
        const player = this.ctx.player();
        const room = this.ctx.requireCurrentRoom();
        const exit = room.getExit(direction);
        if (!exit) {
            return { type: 'noSuchExit' };
        }
        if (exit.isBlocked()) {
            return { type: 'exitBlocked' };
        }
        const destination = this.ctx.room(exit.destinationRoomId);
        if (!destination) {
            throw new RoomNotFoundError(exit.destinationRoomId);
        }
        player.moveTo(destination);
        return { type: 'moved', room: destination };
    }
}
