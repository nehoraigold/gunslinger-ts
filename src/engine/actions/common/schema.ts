import { z } from 'zod';
import { Direction, LightLevel } from '../../room';
import { ItemType, UseEffect } from '../../item';
import { NpcMood } from '../../npc';
import { HealthProse } from '../../combat';

export const DirectionSchema: z.ZodType<Direction> = z.enum(['north', 'south', 'west', 'east', 'up', 'down']);

export const UseEffectSchema: z.ZodType<UseEffect> = z.discriminatedUnion('type', [
    z.object({ type: z.literal('heal'), value: z.number().describe('HP restored') }),
    z.object({ type: z.literal('damage'), value: z.number().describe('HP dealt to target') }),
    z.object({
        type: z.literal('poison'),
        damage: z.number().describe('HP dealt per turn'),
        duration: z.number().describe('Number of turns the effect lasts'),
    }),
    z.object({ type: z.literal('unlock'), flagKey: z.string().describe('Flag set to true in game state') }),
    z.object({ type: z.literal('revealLore'), text: z.string().describe('The lore text revealed') }),
    z.object({
        type: z.literal('applyBuff'),
        effectId: z.string(),
        name: z.string(),
        description: z.string(),
        duration: z.number().describe('Number of turns the buff lasts'),
    }),
]);
export const ItemTypeSchema: z.ZodType<ItemType> = z.enum(['weapon', 'armor', 'consumable', 'key', 'lore', 'misc']);
export const NpcMoodSchema: z.ZodType<NpcMood> = z.enum(['friendly', 'neutral', 'guarded', 'suspicious', 'hostile']);
export const HealthProseSchema: z.ZodType<HealthProse> = z.enum(['healthy', 'bruised', 'wounded', 'battered', 'fatal']);
export const LightLevelSchema: z.ZodType<LightLevel> = z.enum(['bright', 'dim', 'dark']);

export const ItemStatsSchema = z.object({
    damage: z.number().optional().describe('Damage done to enemies if used or equipped'),
    defense: z.number().optional().describe('Damage reduction provided if used or equipped'),
    speedModifier: z.number().optional().describe('Agility multiplier if used or equipped'),
    strengthRequirement: z.number().optional().describe('Minimum strength stat to equip'),
    agilityRequirement: z.number().optional().describe('Minimum agility stat to equip'),
});

export const ExitSummarySchema = z.object({
    direction: DirectionSchema.describe('The direction of the exit'),
    destinationName: z.string().describe('Where the exit leads'),
    hint: z.string().optional(),
});

export const ItemSummarySchema = z.object({
    id: z.string().describe('The item ID'),
    name: z.string().describe('The item name'),
    shortDesc: z.string().describe('A short description of the item'),
    type: ItemTypeSchema.describe('The item type'),
    useEffect: UseEffectSchema.optional().describe('The effect when this item is used, if any'),
    quantity: z.number().describe('How many of this item are present'),
});

export const NpcSummarySchema = z.object({
    id: z.string().describe('The NPC ID'),
    name: z.string().describe('The NPC name'),
    appearance: z.string().describe("The NPC's physical appearance"),
    mood: NpcMoodSchema.describe('The mood of the NPC toward the player'),
    health: HealthProseSchema.describe("The state of the NPC's health"),
});

export const ItemSchema = z.object({
    id: z.string().describe('The item ID'),
    name: z.string().describe('The item name'),
    fullDescription: z.string().describe('The full item description'),
    type: ItemTypeSchema,
    stats: ItemStatsSchema.optional(),
    useEffect: UseEffectSchema.optional(),
    consumedOnUse: z.boolean(),
    usageHint: z.string().optional(),
    revealedSecrets: z.array(z.string()),
});

export const PlayerStatsSchema = z.object({
    strength: z.number().describe("The player's strength"),
    agility: z.number().describe("The player's agility"),
    intelligence: z.number().describe("The player's intelligence"),
    endurance: z.number().describe("The player's endurance"),
});
