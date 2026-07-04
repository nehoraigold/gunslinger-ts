import { z } from 'zod';
import { Action } from '../Action';
import { Verdict } from '../Verdict';
import { defineActionOutcome } from '../ActionOutcome';
import { Context } from '../../context';
import { Direction } from '../../state';
import { MovementService } from '../../service/movement/MovementService';
import { DefaultMovementService } from '../../service/movement/DefaultMovementService';
import { assertNever } from '../../../utils/assertNever';
import { Parser, ZodParser } from '../../../utils/parser';

const DirectionSchema = z.enum(['north', 'south', 'east', 'west', 'up', 'down']) satisfies z.ZodType<Direction>;
const MoveInputSchema = z.object({ direction: DirectionSchema });
const MoveSuccessDataSchema = z.object({ roomId: z.string() });
const MoveFailReasonSchema = z.enum(['no_exit', 'exit_blocked']);
const MoveOutcomeSchema = defineActionOutcome(MoveSuccessDataSchema, MoveFailReasonSchema);

type MoveInput = z.infer<typeof MoveInputSchema>;
type MoveOutcome = z.infer<typeof MoveOutcomeSchema>;

export class MoveAction implements Action<MoveInput, MoveOutcome> {
    readonly name = 'move';
    readonly inputSchema = MoveInputSchema;
    readonly outcomeSchema = MoveOutcomeSchema;
    readonly inputParser: Parser<MoveInput> = new ZodParser(MoveInputSchema);

    constructor(
        private readonly createMovementService: (ctx: Context) => MovementService = (ctx) =>
            new DefaultMovementService(ctx),
    ) {}

    execute(ctx: Context, input: MoveInput): MoveOutcome {
        const result = this.createMovementService(ctx).move(input.direction);
        switch (result.type) {
            case 'moved':
                return Verdict.succeed({ roomId: result.room.id });
            case 'noSuchExit':
                return Verdict.fail('no_exit');
            case 'exitBlocked':
                return Verdict.fail('exit_blocked');
            default:
                return assertNever(result);
        }
    }
}
