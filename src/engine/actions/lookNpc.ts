import { z } from 'zod';

import { NpcSummarySchema } from './common/schema';
import { defineAction } from './Action';
import { healthValueToProse } from '../state/utils';
import { isAlive } from '../npc';

export const LookNpcAction = defineAction({
    name: 'lookNpc',
    inputSchema: z.object({
        npcId: z.string().describe('The ID of the NPC'),
    }),
    successDataSchema: NpcSummarySchema.extend({
        personality: z.string().optional(),
        notableFeatures: z.array(z.string()).optional(),
        visibleEquipment: z.array(z.string()).optional(),
    }),
    failReasonSchema: z.enum(['no_such_npc', 'npc_not_found']),
    execute: (state, { npcId }, { fail, succeed }) => {
        const npc = state.world.npcs[npcId];
        if (!npc) {
            return fail('no_such_npc', `Unable to find npc with ID ${npcId}`);
        }
        const npcInRoom = state.world.rooms[state.player.currentRoomId].npcIds.includes(npcId);
        if (!npcInRoom) {
            return fail('npc_not_found', `${npc.name} is not present`);
        }

        if (!isAlive(npc)) {
            return succeed({ id: npcId, name: npc.name, isAlive: false }, state);
        }

        return succeed(
            {
                id: npcId,
                name: npc.name,
                isAlive: true,
                appearance: npc.appearance,
                mood: npc.mood,
                health: healthValueToProse({ health: npc.health, maxHealth: npc.maxHealth }),
                personality: npc.personality,
                notableFeatures: npc.notableFeatures.map(({ feature }) => feature),
                visibleEquipment: npc.visibleEquipment,
            },
            state,
        );
    },
});
