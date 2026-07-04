import { z } from 'zod';
import { defineAction } from '../Action';
import { Direction } from '../../state';
import { MovementService } from '../../service/movement/MovementService';
import { MovementOutcome } from '../../service/movement/MovementOutcome';
import { assertNever } from '../../../utils/assertNever';

const DirectionSchema = z.enum(['north', 'south', 'east', 'west', 'up', 'down']) satisfies z.ZodType<Direction>;

export const MoveAction = defineAction({
    name: 'move',
    inputSchema: z.object({ direction: DirectionSchema }),
    successDataSchema: z.object({ roomId: z.string() }),
    failReasonSchema: z.enum(['no_exit', 'exit_blocked']),
    execute: (ctx, { direction }, { fail, succeed }) => {
        const result: MovementOutcome = new MovementService(ctx).move(direction);
        switch (result.type) {
            case 'moved':
                return succeed({ roomId: result.room.id });
            case 'noSuchExit':
                return fail('no_exit');
            case 'exitBlocked':
                return fail('exit_blocked');
            default:
                return assertNever(result);
        }
    },
});
