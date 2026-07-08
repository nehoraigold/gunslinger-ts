import { z } from 'zod';
import { Action } from '../Action';
import { Verdict } from '../Verdict';
import { defineActionOutcome } from '../ActionOutcome';
import { Context } from '../../context';
import { Direction } from '../../state';
import { MovementService } from '../../service/movement/MovementService';
import { DefaultMovementService } from '../../service/movement/DefaultMovementService';
import { Condition } from '../../condition';
import { assertNever } from '../../../utils/assertNever';
import { Schema, ZodSchema } from '../../../utils/schema';

const DirectionSchema = z.enum(['north', 'south', 'east', 'west', 'up', 'down']) satisfies z.ZodType<Direction>;
const MoveInputSchema = z.object({ direction: DirectionSchema });
const MoveSuccessDataSchema = z.object({ roomId: z.string() });
const MoveFailReasonSchema = z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('no_exit') }),
    z.object({ kind: z.literal('exit_blocked') }),
    z.object({ kind: z.literal('entry_barred'), unmet: z.array(z.custom<Condition>()) }),
]);
const MoveOutcomeSchema = defineActionOutcome(MoveSuccessDataSchema, MoveFailReasonSchema);

type MoveInput = z.infer<typeof MoveInputSchema>;
type MoveOutcome = z.infer<typeof MoveOutcomeSchema>;

export class MoveAction implements Action<MoveInput, MoveOutcome> {
    readonly name = 'move';
    readonly schema: Schema<MoveInput> = new ZodSchema(MoveInputSchema);
    readonly outcomeSchema = MoveOutcomeSchema;

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
                return Verdict.fail({ kind: 'no_exit' });
            case 'exitBlocked':
                return Verdict.fail({ kind: 'exit_blocked' });
            case 'entryBarred':
                return Verdict.fail({ kind: 'entry_barred', unmet: result.unmet });
            default:
                return assertNever(result);
        }
    }
}
