import { z } from 'zod';
import { Action } from '../Action';
import { Verdict } from '../Verdict';
import { defineActionOutcome } from '../ActionOutcome';
import { Context } from '../../context';
import { Direction, ExitBlockReason, LightLevel } from '../../state';
import { Exit } from '../../entity';
import { Schema, ZodSchema } from '../../../utils/schema';

const DirectionSchema = z.enum(['north', 'south', 'east', 'west', 'up', 'down']) satisfies z.ZodType<Direction>;
const LightLevelSchema = z.enum(['bright', 'dim', 'dark']) satisfies z.ZodType<LightLevel>;
const ExitBlockReasonSchema = z.enum(['door_locked']) satisfies z.ZodType<ExitBlockReason>;

const LookInputSchema = z.void();
const LookSuccessDataSchema = z.object({
    room: z.object({
        name: z.string().describe('The name of the current room'),
        description: z.string().describe('The description of the current room'),
        lightLevel: LightLevelSchema.describe('How well lit the room is'),
    }),
    firstVisit: z.boolean().describe('Whether the player is observing this room for the first time'),
    exits: z
        .array(
            z.object({
                direction: DirectionSchema,
                isBlocked: z.boolean(),
                blockReason: ExitBlockReasonSchema.optional().describe('Why the exit is blocked, if it is'),
            }),
        )
        .describe('The exits leading out of the room'),
    items: z
        .array(z.object({ itemId: z.string(), name: z.string(), quantity: z.number() }))
        .describe('The items present in the room'),
});
const LookFailReasonSchema = z.never();
const LookOutcomeSchema = defineActionOutcome(LookSuccessDataSchema, LookFailReasonSchema);

type LookInput = z.infer<typeof LookInputSchema>;
type LookOutcome = z.infer<typeof LookOutcomeSchema>;

export class LookAction implements Action<LookInput, LookOutcome> {
    readonly name = 'look';
    readonly schema: Schema<LookInput> = new ZodSchema(LookInputSchema);
    readonly outcomeSchema = LookOutcomeSchema;

    execute(ctx: Context): LookOutcome {
        const room = ctx.requireCurrentRoom();
        const firstVisit = !room.visited;
        room.markVisited();

        const items = room
            .inventory()
            .list()
            .map(({ itemId, quantity }) => ({
                itemId,
                name: ctx.item(itemId)?.name ?? itemId,
                quantity,
            }));

        return Verdict.succeed({
            room: { name: room.name, description: room.description, lightLevel: room.lightLevel },
            firstVisit,
            exits: room.exits().map((exit) => this.describeExit(exit)),
            items,
        });
    }

    private describeExit(exit: Exit): { direction: Direction; isBlocked: boolean; blockReason?: ExitBlockReason } {
        const blockReason = exit.blockReason();
        return {
            direction: exit.direction,
            isBlocked: exit.isBlocked(),
            ...(blockReason ? { blockReason } : {}),
        };
    }
}
