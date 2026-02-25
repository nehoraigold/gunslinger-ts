import { z } from 'zod';

import { healthValueToProse } from '../../engine/state/utils';
import { NpcSummarySchema } from './common/schema';
import { defineAction } from './Action';

export const LookNpcAction = defineAction({
    name: 'lookNpc',
    inputSchema: z.object({
        npcId: z.string().describe('The ID of the NPC'),
    }),
    successDataSchema: NpcSummarySchema.extend({
        appearance: z.string(),
        personality: z.string(),
        notableFeatures: z.array(z.string()).optional(),
        visibleEquipment: z.array(z.string()).optional(),
    }),
    failReasonSchema: z.enum(['npc_not_found', 'npc_not_in_room']),
    execute: (state, { npcId }) => {
        const npc = state.world.npcs[npcId];
        if (!npc) {
            return {
                outcome: {
                    result: 'failure',
                    reason: 'npc_not_found',
                    message: `Unable to find npc with ID ${npcId}`,
                } as const,
            };
        }
        const npcInRoom = state.world.rooms[state.player.currentRoomId].npcIds.includes(npcId);
        if (!npcInRoom) {
            return {
                outcome: {
                    result: 'failure',
                    reason: 'npc_not_in_room',
                    message: `${npc.name} is not present`,
                } as const,
            };
        }
        return {
            state,
            outcome: {
                result: 'success',
                data: {
                    id: npcId,
                    name: npc.name,
                    description: npc.appearance,
                    mood: npc.mood,
                    health: healthValueToProse(npc),
                    appearance: npc.appearance,
                    personality: npc.personality,
                    notableFeatures: npc.notableFeatures.map(({ feature }) => feature),
                    visibleEquipment: npc.visibleEquipment,
                },
            },
        };
    },
});
