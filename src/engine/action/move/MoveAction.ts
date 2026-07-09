import { z } from 'zod';
import { Action } from '../Action';
import { ActionOutcome, defineActionOutcome } from '../ActionOutcome';
import { Context } from '../../context';
import { Direction, ExitBlockReason } from '../../state';
import { MovementService } from '../../service/movement/MovementService';
import { DefaultMovementService } from '../../service/movement/DefaultMovementService';
import { Condition } from '../../condition';
import { assertNever } from '../../../utils/assertNever';
import { Schema, ZodSchema } from '../../../utils/schema';

const DirectionSchema = z.enum(['north', 'south', 'east', 'west', 'up', 'down']) satisfies z.ZodType<Direction>;
const MoveInputSchema = z.object({ direction: DirectionSchema });
const MoveSuccessDataSchema = z.object({ roomId: z.string() });
const MoveFailReasonSchema = z.discriminatedUnion('type', [
    z.object({ type: z.literal('no_exit') }),
    z.object({ type: z.literal('exit_blocked'), reasons: z.array(z.object({ type: z.custom<ExitBlockReason>() })) }),
    z.object({ type: z.literal('entry_barred'), reasons: z.array(z.custom<Condition>()) }),
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
                return ActionOutcome.succeed({ roomId: result.room.id });
            case 'noSuchExit':
                return ActionOutcome.fail({ type: 'no_exit' });
            case 'exitBlocked':
                return ActionOutcome.fail({ type: 'exit_blocked', reasons: [{ type: result.blockReason }] });
            case 'entryBarred':
                return ActionOutcome.fail({ type: 'entry_barred', reasons: result.unmet });
            default:
                return assertNever(result);
        }
    }
}
