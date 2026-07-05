import { z } from 'zod';
import { Action } from '../Action';
import { Verdict } from '../Verdict';
import { defineActionOutcome } from '../ActionOutcome';
import { Context } from '../../context';
import { Direction } from '../../state';
import { LockService } from '../../service/lock/LockService';
import { DefaultLockService } from '../../service/lock/DefaultLockService';
import { assertNever } from '../../../utils/assertNever';
import { Schema, ZodSchema } from '../../../utils/schema';

const DirectionSchema = z.enum(['north', 'south', 'east', 'west', 'up', 'down']) satisfies z.ZodType<Direction>;
const UnlockInputSchema = z.object({ direction: DirectionSchema });
const UnlockSuccessDataSchema = z.object({ direction: DirectionSchema, keyItemId: z.string() });
const UnlockFailReasonSchema = z.enum(['no_exit', 'not_lockable', 'already_unlocked', 'missing_key']);
const UnlockOutcomeSchema = defineActionOutcome(UnlockSuccessDataSchema, UnlockFailReasonSchema);

type UnlockInput = z.infer<typeof UnlockInputSchema>;
type UnlockOutcome = z.infer<typeof UnlockOutcomeSchema>;

export class UnlockAction implements Action<UnlockInput, UnlockOutcome> {
    readonly name = 'unlock';
    readonly schema: Schema<UnlockInput> = new ZodSchema(UnlockInputSchema);
    readonly outcomeSchema = UnlockOutcomeSchema;

    constructor(private readonly lockService: LockService = new DefaultLockService()) {}

    execute(ctx: Context, input: UnlockInput): UnlockOutcome {
        const exit = ctx.requireCurrentRoom().getExit(input.direction);
        if (!exit) {
            return Verdict.fail('no_exit');
        }

        const lock = exit.lock();
        if (!lock) {
            return Verdict.fail('not_lockable');
        }

        const keyItemId = lock.keyItemId;
        const result = this.lockService.unlock(lock, ctx.player().inventory());
        switch (result.type) {
            case 'unlocked':
                return Verdict.succeed({ direction: input.direction, keyItemId });
            case 'alreadyUnlocked':
                return Verdict.fail('already_unlocked');
            case 'missingKey':
                return Verdict.fail('missing_key');
            default:
                return assertNever(result);
        }
    }
}
