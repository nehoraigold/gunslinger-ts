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
        canFlee: z
            .boolean()
            .optional()
            .describe(
                'Whether the player can flee this combat. Defaults to true. Only set false for inescapable encounters.',
            ),
    }),
    successDataSchema: z.object({
        playerDamageDealt: z
            .number()
            .describe(
                'Damage dealt by the player to the enemy this round. Never expose this number in narration — translate to prose using playerAttackType.',
            ),
        playerAttackType: AttackTypeSchema.describe(
            "The nature of the player's attack. Use to calibrate narration: critical = visceral and dramatic; hit = clean and confident; glancing = half a sentence; miss = brief, enemy still dangerous.",
        ),
        enemyDamageDealt: z
            .number()
            .describe(
                'Damage dealt by the enemy to the player this round. Never expose this number in narration — translate to prose using enemyAttackType.',
            ),
        enemyAttackType: AttackTypeSchema.describe(
            "The nature of the enemy's counterattack. Use to calibrate narration the same way as playerAttackType.",
        ),
        playerHealthProse: HealthProseSchema.describe(
            'Player health state after the round. Always use this for narration — never expose raw HP numbers.',
        ),
        enemyHealthProse: HealthProseSchema.describe(
            'Enemy health state after the round. Always use this for narration — end every round with this. Never expose raw HP numbers.',
        ),
        enemyDefeated: z
            .boolean()
            .describe(
                'Whether the enemy was defeated this round. If true: give the kill one sentence of weight, then mention loot naturally as part of the aftermath — never list it.',
            ),
        playerDefeated: z
            .boolean()
            .describe(
                'Whether the player was defeated this round. If true: narrate death with full gravity, then step outside fiction to offer restart.',
            ),
        lootDropped: z
            .array(ItemSchema)
            .optional()
            .describe(
                'Items dropped by the enemy on defeat. Mention naturally as part of the aftermath — never list them as a reward screen.',
            ),
        xpGained: z
            .number()
            .optional()
            .describe(
                'XP awarded to the player on enemy defeat. Do not narrate this value — no level system exists yet.',
            ),
        combatStarted: z
            .boolean()
            .optional()
            .describe(
                'True when this attack also initiated combat — weave the ambush or confrontation into narration.',
            ),
    }),
    failReasonSchema: z.enum(['enemy_not_found', 'enemy_not_in_room', 'enemy_already_defeated']),
    execute: (state, { targetId, canFlee = true }, { fail, succeed }) => {
        const enemy = state.world.npcs[targetId];

        if (!state.combat) {
            // Auto-start combat — validate same as startCombat
            if (!enemy) {
                return fail('enemy_not_found', `No NPC with ID ${targetId}`);
            }
            const room = state.world.rooms[state.player.currentRoomId];
            if (!room.npcIds.includes(targetId)) {
                return fail('enemy_not_in_room', `${enemy.name} is not in the current room`);
            }
            if (!isAlive(enemy)) {
                return fail('enemy_already_defeated', `${enemy.name} is already dead`);
            }
        } else {
            if (!enemy || state.combat.enemyId !== targetId) {
                return fail('enemy_not_found', `No enemy with ID ${targetId} in current combat`);
            }
            if (!isAlive(enemy)) {
                return fail('enemy_already_defeated', `${enemy.name} has already been defeated`);
            }
        }

        const combatStarted = state.combat === null;

        const playerStats = derivePlayerStats(state.player, state.world.items);

        const combat = state.combat;
        const playerAttackBonus = combat ? combat.playerModifiers.reduce((sum, m) => sum + (m.attackBonus ?? 0), 0) : 0;
        const playerDefenseBonus = combat
            ? combat.playerModifiers.reduce((sum, m) => sum + (m.defenseBonus ?? 0), 0)
            : 0;
        const enemyAttackBonus = combat ? combat.enemyModifiers.reduce((sum, m) => sum + (m.attackBonus ?? 0), 0) : 0;
        const enemyDefenseBonus = combat ? combat.enemyModifiers.reduce((sum, m) => sum + (m.defenseBonus ?? 0), 0) : 0;

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
            if (!draft.combat) {
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
            }

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
                combatStarted: combatStarted || undefined,
            },
            nextState,
        );
    },
});
