import { z } from 'zod';
import { produce } from 'immer';

import { healthValueToProse } from '../../engine/state/utils';
import { ExitSummarySchema, ItemSummarySchema, NpcSummarySchema, LightLevelSchema } from './common/schema';
import { defineAction } from './Action';

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
    execute: (state, _input) => {
        const room = state.world.rooms[state.player.currentRoomId];
        if (!room) {
            throw new Error(`Unable to locate room ${state.player.currentRoomId}`);
        }

        const nextState = produce(state, (draft) => {
            draft.world.rooms[draft.player.currentRoomId].lastLookedAtTurn = draft.turnCount;
        });

        return {
            state: nextState,
            outcome: {
                result: 'success',
                data: {
                    id: room.id,
                    name: room.name,
                    description: room.description,
                    exits: room.exits.map((exit) => ({
                        direction: exit.direction,
                        destinationName: state.world.rooms[exit.destinationRoomId].name,
                        hint: exit.hint,
                    })),
                    items: Object.entries(room.items)
                        .map(([id, quantity]) => {
                            const item = state.world.items[id];
                            if (!item) {
                                return null;
                            }
                            const { name, shortDesc, type, interactable } = item;
                            return { id, name, shortDesc, type, interactable, quantity };
                        })
                        .filter((i) => !!i),
                    npcs: room.npcIds
                        .map((id) => state.world.npcs[id])
                        .map((npc) => ({ ...npc, health: healthValueToProse(npc) })),
                    lightLevel: room.lightLevel,
                },
            },
        };
    },
});
