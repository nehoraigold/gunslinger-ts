import { z } from 'zod';
import { produce } from 'immer';

import { healthValueToProse } from '../../engine/state/utils';
import { DirectionSchema, ExitSummarySchema, ItemSummarySchema, NpcSummarySchema } from './common/schema';
import { defineAction } from './Action';

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
    execute: (state, { direction }) => {
        const { player, world } = state;
        const currentRoom = world.rooms[player.currentRoomId];

        if (!currentRoom) {
            throw new Error(`Invalid current room id ${player.currentRoomId}`);
        }

        const exit = currentRoom.exits.find((exit) => exit.direction === direction);
        if (!exit) {
            return {
                outcome: {
                    result: 'failure',
                    reason: 'no_exit',
                    message: `There is no exit in direction ${direction}`,
                } as const,
            };
        }

        if (exit.isBlocked) {
            return {
                outcome: {
                    result: 'failure',
                    reason: 'exit_is_blocked',
                    message: exit.blockReason ?? `The exit ${direction} is blocked`,
                } as const,
            };
        }

        const nextRoom = world.rooms[exit.destinationRoomId];
        if (!nextRoom) {
            throw new Error(`Invalid destination room id ${exit.destinationRoomId}`);
        }

        const nextState = produce(state, (draft) => {
            draft.world.rooms[player.currentRoomId].visited = true;
            draft.player.currentRoomId = nextRoom.id;
        });

        return {
            state: nextState,
            outcome: {
                result: 'success',
                data: {
                    newRoomId: nextRoom.id,
                    newRoomName: nextRoom.name,
                    newRoomDescription: nextRoom.description,
                    isFirstVisit: !nextRoom.visited,
                    exits: nextRoom.exits.map((exit) => ({
                        direction: exit.direction,
                        destinationName: nextState.world.rooms[exit.destinationRoomId].name,
                        hint: exit.hint,
                    })),
                    items: Object.entries(nextRoom.items)
                        .map(([id, quantity]) => {
                            const item = state.world.items[id];
                            if (!item) {
                                return null;
                            }
                            const { name, shortDesc, type, interactable } = item;
                            return { id, name, shortDesc, type, interactable, quantity };
                        })
                        .filter((i) => !!i),
                    npcs: nextRoom.npcIds
                        .map((id) => nextState.world.npcs[id])
                        .map((npc) => ({ ...npc, health: healthValueToProse(npc) })),
                },
            },
        };
    },
});
