import { z } from 'zod';
import { DirectionSchema } from './common/schema';
import { defineAction } from './Action';
import { evaluateCondition } from '../condition';

export const LookExitAction = defineAction({
    name: 'lookExit',
    inputSchema: z.object({
        direction: DirectionSchema,
    }),
    successDataSchema: z.object({
        direction: DirectionSchema,
        destinationName: z.string().optional().describe('Only present if the player has visited that room before'),
        description: z.string(),
        isBlocked: z.boolean(),
        blockReason: z.string().optional(),
    }),
    failReasonSchema: z.enum(['exit_not_found']),
    execute: (state, { direction }, { fail, succeed }) => {
        const { world, player } = state;
        const room = world.rooms[player.currentRoomId];
        if (!room) {
            throw new Error(`Unable to locate room ${player.currentRoomId}`);
        }
        const exit = room.exits.find((exit) => exit.direction === direction);
        if (!exit) {
            return fail('exit_not_found', `No exit in direction ${direction}`);
        }

        const dest = world.rooms[exit.destinationRoomId];
        const conditionBlocked = exit.blockCondition ? evaluateCondition(state, exit.blockCondition) : false;
        const isBlocked = exit.isBlocked || conditionBlocked;
        const blockReason = isBlocked
            ? conditionBlocked
                ? (exit.blockConditionReason ?? exit.blockReason)
                : exit.blockReason
            : undefined;

        return succeed(
            {
                direction,
                destinationName: dest.visited ? dest.name : undefined,
                description: exit.description,
                isBlocked,
                blockReason,
            },
            state,
        );
    },
});
