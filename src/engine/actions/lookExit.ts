import { z } from 'zod';
import { DirectionSchema } from './common/schema';
import { defineAction } from './Action';

export const LookExitAction = defineAction({
    name: 'lookExit',
    inputSchema: z.object({
        direction: DirectionSchema,
    }),
    successDataSchema: z.object({
        direction: DirectionSchema,
        destinationName: z.string(),
        description: z.string(),
        isBlocked: z.boolean(),
        blockReason: z.string().optional(),
    }),
    failReasonSchema: z.enum(['exit_not_found']),
    execute: (state, { direction }) => {
        const { world, player } = state;
        const room = world.rooms[player.currentRoomId];
        if (!room) {
            throw new Error(`Unable to locate room ${player.currentRoomId}`);
        }
        const exit = room.exits.find((exit) => exit.direction === direction);
        if (!exit) {
            return {
                outcome: {
                    result: 'failure',
                    reason: 'exit_not_found',
                    message: `No exit in direction ${direction}`,
                } as const,
            };
        }

        return {
            state,
            outcome: {
                result: 'success',
                data: {
                    direction,
                    destinationName: world.rooms[exit.destinationRoomId].name,
                    description: exit.description,
                    isBlocked: exit.isBlocked,
                    blockReason: exit.blockReason,
                },
            },
        };
    },
});
