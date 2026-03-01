import { z } from 'zod';
import { produce } from 'immer';
import { AttackType } from '../combat';
import { derivePlayerStats } from '../player';
import { healthValueToProse } from '../state/utils';
import { defineAction } from './Action';
import { HealthProseSchema } from './common/schema';
import { ItemSchema } from './common/schema';
import { toItemSchema, defeatEnemy, rollAttack } from './common/utils';
import { Item } from '../item';
import { isAlive } from '../npc';

const AttackTypeSchema: z.ZodType<AttackType> = z.enum(['hit', 'miss', 'critical', 'glancing']);

export const AttackAction = defineAction({
    name: 'attack',
    inputSchema: z.object({
        targetId: z.string().describe('The NPC ID of the enemy to attack'),
        ability: z.string().nullish().describe('Optional special ability or attack style'),
    }),
    successDataSchema: z.object({
        playerDamageDealt: z.number().describe('Damage dealt by the player to the enemy this round'),
        playerAttackType: AttackTypeSchema.describe("The nature of the player's attack"),
        enemyDamageDealt: z.number().describe('Damage dealt by the enemy to the player this round'),
        enemyAttackType: AttackTypeSchema.describe("The nature of the enemy's counterattack"),
        playerHealthProse: HealthProseSchema.describe('Player health state after the round'),
        enemyHealthProse: HealthProseSchema.describe('Enemy health state after the round'),
        enemyDefeated: z.boolean().describe('Whether the enemy was defeated this round'),
        playerDefeated: z.boolean().describe('Whether the player was defeated this round'),
        lootDropped: z.array(ItemSchema).optional().describe('Items dropped by the enemy on defeat'),
        xpGained: z.number().optional().describe('XP awarded to the player on enemy defeat'),
    }),
    failReasonSchema: z.enum(['not_in_combat', 'enemy_not_found', 'enemy_already_defeated']),
    execute: (state, { targetId }, { fail, succeed }) => {
        if (!state.combat) {
            return fail('not_in_combat', 'No active combat encounter');
        }

        const enemy = state.world.npcs[targetId];
        if (!enemy || state.combat.enemyId !== targetId) {
            return fail('enemy_not_found', `No enemy with ID ${targetId} in current combat`);
        }

        if (!isAlive(enemy)) {
            return fail('enemy_already_defeated', `${enemy.name} has already been defeated`);
        }

        const playerStats = derivePlayerStats(state.player, state.world.items);

        const playerAttackBonus = state.combat.playerModifiers.reduce((sum, m) => sum + (m.attackBonus ?? 0), 0);
        const playerDefenseBonus = state.combat.playerModifiers.reduce((sum, m) => sum + (m.defenseBonus ?? 0), 0);
        const enemyAttackBonus = state.combat.enemyModifiers.reduce((sum, m) => sum + (m.attackBonus ?? 0), 0);
        const enemyDefenseBonus = state.combat.enemyModifiers.reduce((sum, m) => sum + (m.defenseBonus ?? 0), 0);

        const playerRoll = rollAttack(playerStats.attackPower + playerAttackBonus, enemy.defense + enemyDefenseBonus);
        const enemyRoll = rollAttack(enemy.attackPower + enemyAttackBonus, playerStats.defense + playerDefenseBonus);

        const newEnemyHealth = Math.max(0, enemy.health - playerRoll.damage);
        const newPlayerHealth = Math.max(0, state.player.health - enemyRoll.damage);
        const enemyDefeated = newEnemyHealth === 0;
        const playerDefeated = newPlayerHealth === 0;

        const lootEntries: { item: Item; quantity: number }[] = [];
        if (enemyDefeated) {
            for (const entry of enemy.lootTable) {
                if (Math.random() < entry.dropChance) {
                    const item = state.world.items[entry.itemId];
                    if (item) {
                        lootEntries.push({ item, quantity: entry.quantity });
                    }
                }
            }
        }

        const nextState = produce(state, (draft) => {
            draft.world.npcs[targetId].health = newEnemyHealth;
            draft.player.health = newPlayerHealth;

            if (!enemyDefeated && draft.combat) {
                draft.combat.roundLog.push({
                    round: draft.combat.round,
                    playerDamageDealt: playerRoll.damage,
                    playerAttackType: playerRoll.attackType,
                    enemyDamageDealt: enemyRoll.damage,
                    enemyAttackType: enemyRoll.attackType,
                    playerHealthAfter: newPlayerHealth,
                    enemyHealthAfter: newEnemyHealth,
                });
                draft.combat.round += 1;
            }

            if (enemyDefeated) {
                defeatEnemy(draft, targetId, lootEntries);
            }

            return draft;
        });

        return succeed(
            {
                playerDamageDealt: playerRoll.damage,
                playerAttackType: playerRoll.attackType,
                enemyDamageDealt: enemyRoll.damage,
                enemyAttackType: enemyRoll.attackType,
                playerHealthProse: healthValueToProse({ health: newPlayerHealth, maxHealth: state.player.maxHealth }),
                enemyHealthProse: healthValueToProse({ health: newEnemyHealth, maxHealth: enemy.maxHealth }),
                enemyDefeated,
                playerDefeated,
                lootDropped: lootEntries.length > 0 ? lootEntries.map(({ item }) => toItemSchema(item)) : undefined,
                xpGained: enemyDefeated ? enemy.xpValue : undefined,
            },
            nextState,
        );
    },
});
