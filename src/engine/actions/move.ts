import { z } from 'zod';
import { produce } from 'immer';

import { DirectionSchema, ExitSummarySchema, ItemSummarySchema, NpcSummarySchema } from './common/schema';
import { defineAction } from './Action';
import { getVisibleRoomItems, getRoomNpcs } from './common/utils';

export const MoveAction = defineAction({
    name: 'move',
    inputSchema: z.object({
        direction: DirectionSchema.describe('The direction the player wants to move'),
    }),
    successDataSchema: z.object({
        newRoomId: z.string().describe('The room ID'),
        newRoomName: z.string().describe('The room name'),
        newRoomDescription: z.string().describe('The room description'),
        isFirstVisit: z.boolean().describe('Whether this is the first time the player has visited this room'),
        exits: z.array(ExitSummarySchema).describe('The exits in this room'),
        items: z.array(ItemSummarySchema).describe('The items present in this room'),
        npcs: z.array(NpcSummarySchema).describe('The NPCs present in this room'),
    }),
    failReasonSchema: z.enum(['no_exit', 'exit_is_blocked', 'in_combat']),
    execute: (state, { direction }, { fail, succeed }) => {
        const { player, world } = state;
        const currentRoom = world.rooms[player.currentRoomId];

        if (!currentRoom) {
            throw new Error(`Invalid current room id ${player.currentRoomId}`);
        }

        const exit = currentRoom.exits.find((exit) => exit.direction === direction);
        if (!exit) {
            return fail('no_exit', `There is no exit in direction ${direction}`);
        }

        if (exit.isBlocked) {
            return fail('exit_is_blocked', exit.blockReason ?? `The exit ${direction} is blocked`);
        }

        const nextRoom = world.rooms[exit.destinationRoomId];
        if (!nextRoom) {
            throw new Error(`Invalid destination room id ${exit.destinationRoomId}`);
        }

        const isFirstVisit = !nextRoom.visited;

        const nextState = produce(state, (draft) => {
            draft.world.rooms[player.currentRoomId].visited = true;
            draft.player.currentRoomId = nextRoom.id;
            return draft;
        });

        const destRoom = nextState.world.rooms[nextRoom.id];

        return succeed(
            {
                newRoomId: destRoom.id,
                newRoomName: destRoom.name,
                newRoomDescription: destRoom.description,
                isFirstVisit,
                exits: destRoom.exits.map((exit) => ({
                    direction: exit.direction,
                    destinationName: nextState.world.rooms[exit.destinationRoomId].name,
                    hint: exit.hint,
                })),
                items: getVisibleRoomItems(nextState, destRoom),
                npcs: getRoomNpcs(nextState, destRoom),
            },
            nextState,
        );
    },
});
