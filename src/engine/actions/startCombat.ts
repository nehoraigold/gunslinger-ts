import { z } from 'zod';
import { produce } from 'immer';
import { defineAction } from './Action';
import { NpcSummarySchema } from './common/schema';
import { toNpcSummary } from './common/utils';
import { isAlive } from '../npc';

export const StartCombatAction = defineAction({
    name: 'startCombat',
    inputSchema: z.object({
        targetId: z.string().describe('The NPC ID to initiate combat with'),
        canFlee: z
            .boolean()
            .optional()
            .describe(
                'Whether the player can flee this encounter. Defaults to true. Set false for inescapable fights.',
            ),
    }),
    successDataSchema: z.object({
        enemy: NpcSummarySchema.describe('Summary of the enemy entering combat'),
        canFlee: z.boolean().describe('Whether the player can flee this encounter'),
        round: z.number().describe('The starting round number — always 1'),
    }),
    failReasonSchema: z.enum(['already_in_combat', 'npc_not_found', 'npc_not_in_room', 'npc_not_alive']),
    execute: (state, { targetId, canFlee = true }, { fail, succeed }) => {
        if (state.combat !== null) {
            return fail(
                'already_in_combat',
                `Already in combat with ${state.world.npcs[state.combat.enemyId]?.name ?? state.combat.enemyId}`,
            );
        }

        const npc = state.world.npcs[targetId];
        if (!npc) {
            return fail('npc_not_found', `No NPC with ID ${targetId}`);
        }

        const room = state.world.rooms[state.player.currentRoomId];
        if (!room.npcIds.includes(targetId)) {
            return fail('npc_not_in_room', `${npc.name} is not in the current room`);
        }

        if (!isAlive(npc)) {
            return fail('npc_not_alive', `${npc.name} is already dead`);
        }

        const nextState = produce(state, (draft) => {
            if (draft.world.npcs[targetId].mood !== 'hostile') {
                draft.world.npcs[targetId].mood = 'hostile';
            }
            draft.combat = {
                enemyId: targetId,
                round: 1,
                playerTurn: true,
                canFlee,
                playerModifiers: [],
                enemyModifiers: [],
                roundLog: [],
                startedAtTurn: state.turnCount,
            };
            return draft;
        });

        return succeed(
            {
                enemy: toNpcSummary(nextState, targetId)!,
                canFlee,
                round: 1,
            },
            nextState,
        );
    },
});
