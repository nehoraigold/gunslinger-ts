import { Direction } from '../../state';
import { Context } from '../../context';
import { evaluateCondition } from '../../condition';
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
        const destination = this.ctx.requireRoom(exit.destinationRoomId);
        const entryCondition = destination.entryCondition();
        if (entryCondition) {
            const outcome = evaluateCondition(this.ctx, entryCondition);
            if (!outcome.satisfied) {
                return { type: 'entryBarred', unmet: outcome.unmet };
            }
        }
        player.moveTo(destination);
        return { type: 'moved', room: destination };
    }
}
