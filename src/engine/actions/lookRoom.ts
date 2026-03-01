import { z } from 'zod';
import { produce } from 'immer';

import { ExitSummarySchema, ItemSummarySchema, NpcSummarySchema, LightLevelSchema } from './common/schema';
import { defineAction } from './Action';
import { getVisibleRoomItems, getRoomNpcs } from './common/utils';

export const LookRoomAction = defineAction({
    name: 'lookRoom',
    inputSchema: z.void(),
    successDataSchema: z.object({
        id: z.string().describe('The room ID'),
        name: z.string().describe('The room name'),
        description: z.string().describe('The room description'),
        exits: z.array(ExitSummarySchema).describe('The exits in this room'),
        items: z.array(ItemSummarySchema).describe('The items present in this room'),
        npcs: z.array(NpcSummarySchema).describe('The NPCs present in this room'),
        ambientDetail: z.string().optional().describe('An ambient detail about the room'),
        lightLevel: LightLevelSchema.describe('The light level of the room'),
    }),
    failReasonSchema: z.never(),
    execute: (state, _input, { succeed }) => {
        const room = state.world.rooms[state.player.currentRoomId];
        if (!room) {
            throw new Error(`Unable to locate room ${state.player.currentRoomId}`);
        }

        const nextState = produce(state, (draft) => {
            draft.world.rooms[draft.player.currentRoomId].lastLookedAtTurn = draft.turnCount;
            return draft;
        });

        const nextRoom = nextState.world.rooms[room.id];

        return succeed(
            {
                id: nextRoom.id,
                name: nextRoom.name,
                description: nextRoom.description,
                exits: nextRoom.exits.map((exit) => {
                    const dest = nextState.world.rooms[exit.destinationRoomId];
                    return {
                        direction: exit.direction,
                        destinationName: dest.visited ? dest.name : undefined,
                        hint: exit.hint,
                    };
                }),
                items: getVisibleRoomItems(nextState, nextRoom),
                npcs: getRoomNpcs(nextState, nextRoom),
                lightLevel: nextRoom.lightLevel,
            },
            nextState,
        );
    },
});
