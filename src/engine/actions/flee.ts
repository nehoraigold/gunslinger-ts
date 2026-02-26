import { z } from 'zod';
import { produce } from 'immer';
import { derivePlayerStats } from '../player';
import { healthValueToProse } from '../state/utils';
import { defineAction } from './Action';
import { HealthProseSchema } from './common/schema';
import { rollAttack } from './common/utils';

export const FleeAction = defineAction({
    name: 'flee',
    inputSchema: z.void(),
    successDataSchema: z.object({
        fled: z.boolean().describe('Whether the flee attempt succeeded'),
        escapedToRoomId: z.string().optional().describe('Room the player fled to, if successful'),
        escapedToRoomName: z.string().optional().describe('Name of the room fled to, if successful'),
        damageTaken: z.number().describe('Damage taken from the enemy free attack on a failed flee attempt'),
        playerHealthProse: HealthProseSchema.describe('Player health after the attempt'),
    }),
    failReasonSchema: z.enum(['not_in_combat', 'unable_to_flee']),
    execute: (state, _, { fail, succeed }) => {
        if (!state.combat) {
            return fail('not_in_combat', 'No active combat encounter');
        }

        if (!state.combat.canFlee) {
            return fail('unable_to_flee', 'You cannot flee this encounter');
        }

        const enemy = state.world.npcs[state.combat.enemyId];
        const { agility } = state.player.baseStats;
        const fleeChance = agility / (agility + enemy.agility);
        const fled = Math.random() < fleeChance;

        if (fled) {
            const room = state.world.rooms[state.player.currentRoomId];
            const openExits = room.exits.filter((e) => !e.isBlocked);
            const exit = openExits[Math.floor(Math.random() * openExits.length)];

            const nextState = produce(state, (draft) => {
                draft.combat = null;
                if (exit) {
                    draft.player.currentRoomId = exit.destinationRoomId;
                }
                return draft;
            });

            const destRoom = exit ? state.world.rooms[exit.destinationRoomId] : null;

            return succeed(
                {
                    fled: true,
                    escapedToRoomId: destRoom?.id,
                    escapedToRoomName: destRoom?.name,
                    damageTaken: 0,
                    playerHealthProse: healthValueToProse({
                        health: state.player.health,
                        maxHealth: state.player.maxHealth,
                    }),
                },
                nextState,
            );
        }

        const playerStats = derivePlayerStats(state.player, state.world.items);
        const enemyAttackBonus = state.combat.enemyModifiers.reduce((sum, m) => sum + (m.attackBonus ?? 0), 0);
        const playerDefenseBonus = state.combat.playerModifiers.reduce((sum, m) => sum + (m.defenseBonus ?? 0), 0);
        const enemyRoll = rollAttack(enemy.attackPower + enemyAttackBonus, playerStats.defense + playerDefenseBonus);
        const newPlayerHealth = Math.max(0, state.player.health - enemyRoll.damage);

        const nextState = produce(state, (draft) => {
            draft.player.health = newPlayerHealth;
            if (draft.combat) {
                draft.combat.round += 1;
            }
            return draft;
        });

        return succeed(
            {
                fled: false,
                damageTaken: enemyRoll.damage,
                playerHealthProse: healthValueToProse({ health: newPlayerHealth, maxHealth: state.player.maxHealth }),
            },
            nextState,
        );
    },
});
