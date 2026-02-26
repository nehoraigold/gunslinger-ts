import { z } from 'zod';
import { defineAction } from './Action';
import { ItemSchema, PlayerAttributesSchema, CombatStatsSchema, HealthProseSchema } from './common/schema';
import { derivePlayerStats } from '../player';
import { healthValueToProse } from '../state/utils';
import { Item } from '../item';

const toItemFull = (item: Item) => ({
    id: item.id,
    name: item.name,
    fullDescription: item.fullDescription,
    type: item.type,
    stats: item.stats,
    useEffect: item.useEffect,
    consumedOnUse: item.consumedOnUse,
    usageHint: item.usageHint,
    revealedSecrets: [],
});

export const CheckStatusAction = defineAction({
    name: 'checkStatus',
    inputSchema: z.void(),
    successDataSchema: z.object({
        health: z.number().describe("The player's current HP"),
        maxHealth: z.number().describe("The player's maximum HP"),
        healthProse: HealthProseSchema.describe("The player's health as prose"),
        currentRoomId: z.string().describe('The ID of the room the player is currently in'),
        baseStats: PlayerAttributesSchema.describe(
            "The player's base attributes (strength, agility, intelligence, endurance)",
        ),
        combatStats: CombatStatsSchema.describe('Derived combat stats including equipment bonuses'),
        gold: z.number().describe('Gold carried by the player'),
        turnCount: z.number().describe('Number of turns elapsed'),
        equippedWeapon: ItemSchema.nullable().describe('Currently equipped weapon, or null'),
        equippedArmor: ItemSchema.nullable().describe('Currently equipped armor, or null'),
    }),
    failReasonSchema: z.never(),
    execute: (state) => {
        const { player, world } = state;
        const equippedWeapon = player.equippedWeapon ? world.items[player.equippedWeapon] : null;
        const equippedArmor = player.equippedArmor ? world.items[player.equippedArmor] : null;

        return {
            outcome: {
                result: 'success',
                data: {
                    health: player.health,
                    maxHealth: player.maxHealth,
                    healthProse: healthValueToProse({ health: player.health, maxHealth: player.maxHealth }),
                    currentRoomId: player.currentRoomId,
                    baseStats: player.baseStats,
                    combatStats: derivePlayerStats(player, world.items),
                    gold: player.gold,
                    turnCount: state.turnCount,
                    equippedWeapon: equippedWeapon ? toItemFull(equippedWeapon) : null,
                    equippedArmor: equippedArmor ? toItemFull(equippedArmor) : null,
                },
            },
        };
    },
});
