import { z } from 'zod';
import { Direction, LightLevel } from '../../room';
import { ItemType } from '../../item';
import { NpcMood } from '../../npc';
import { HealthProse } from '../../combat';
import { HealEffectSchema } from '../useItem/effects/heal';
import { DamageEffectSchema } from '../useItem/effects/damage';
import { PoisonEffectSchema } from '../useItem/effects/poison';
import { UnlockEffectSchema } from '../useItem/effects/unlock';
import { RevealLoreEffectSchema } from '../useItem/effects/revealLore';
import { RevealItemEffectSchema } from '../useItem/effects/revealItem';
import { ApplyBuffEffectSchema } from '../useItem/effects/applyBuff';

export const DirectionSchema: z.ZodType<Direction> = z.enum(['north', 'south', 'west', 'east', 'up', 'down']);

export const UseEffectSchema = z.discriminatedUnion('type', [
    HealEffectSchema,
    DamageEffectSchema,
    PoisonEffectSchema,
    UnlockEffectSchema,
    RevealLoreEffectSchema,
    RevealItemEffectSchema,
    ApplyBuffEffectSchema,
]);
export const ItemTypeSchema: z.ZodType<ItemType> = z.enum(['weapon', 'armor', 'consumable', 'key', 'lore', 'misc']);
export const NpcMoodSchema: z.ZodType<NpcMood> = z.enum(['friendly', 'neutral', 'guarded', 'suspicious', 'hostile']);
export const HealthProseSchema: z.ZodType<HealthProse> = z.enum(['healthy', 'bruised', 'wounded', 'battered', 'fatal']);
export const LightLevelSchema: z.ZodType<LightLevel> = z.enum(['bright', 'dim', 'dark']);

export const ItemStatsSchema = z.object({
    attackPower: z.number().optional().describe('Attack power bonus added to player strength when equipped'),
    defense: z.number().optional().describe('Defense bonus added to player endurance when equipped'),
    speedModifier: z.number().optional().describe('Agility multiplier (1.0 = no change) when equipped'),
    strengthRequirement: z.number().optional().describe('Minimum strength stat to equip'),
    agilityRequirement: z.number().optional().describe('Minimum agility stat to equip'),
});

export const ExitSummarySchema = z.object({
    direction: DirectionSchema.describe('The direction of the exit'),
    destinationName: z
        .string()
        .optional()
        .describe('Where the exit leads — only present if the player has visited that room before'),
    hint: z
        .string()
        .optional()
        .describe(
            'A flavour hint about the exit — e.g. "the door is ajar" or "a cold draft comes from here". Embed naturally; never append as a separate sentence.',
        ),
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
    isAlive: z.boolean().describe('Whether this NPC is alive'),
    appearance: z.string().optional().describe("The NPC's physical appearance"),
    mood: NpcMoodSchema.optional().describe('The mood of the NPC toward the player'),
    health: HealthProseSchema.optional().describe("The state of the NPC's health"),
});

export const ItemSchema = z.object({
    id: z.string().describe('The item ID'),
    name: z.string().describe('The item name'),
    fullDescription: z
        .string()
        .describe('The full item description. Deliver as prose — never read it as a data field.'),
    type: ItemTypeSchema,
    stats: ItemStatsSchema.optional().describe(
        'Weapon or armor stats. Translate to physical impressions — never expose numbers. Example: high attackPower = "the blade has real weight behind it".',
    ),
    useEffect: UseEffectSchema.optional(),
    onInspectEffect: UseEffectSchema.optional().describe('Effect triggered when this item is examined via lookItem'),
    consumedOnUse: z
        .boolean()
        .describe(
            'True if the item is removed from inventory after use. When true, acknowledge it is gone — e.g. "You drain the last of the potion."',
        ),
    usageHint: z
        .string()
        .optional()
        .describe(
            'An in-world clue about how to use this item. Embed as a character observation — never frame it as a game hint or menu option.',
        ),
    revealedSecrets: z
        .array(z.string())
        .describe(
            'Additional details the player notices on close inspection. Weave in naturally as things the character observes.',
        ),
});

export const PlayerAttributesSchema = z.object({
    strength: z.number().describe("The player's strength"),
    agility: z.number().describe("The player's agility"),
    intelligence: z.number().describe("The player's intelligence"),
    endurance: z.number().describe("The player's endurance"),
});

export const CombatStatsSchema = z.object({
    attackPower: z.number().describe('Combined attack power: player strength + weapon bonus'),
    defense: z.number().describe('Combined defense: player endurance + armor bonus'),
    initiative: z.number().describe('Turn speed: player agility * weapon speed modifier'),
});

export const FlagValueSchema = z
    .union([z.string(), z.number(), z.boolean()])
    .describe('A flag value: string, number, or boolean');
