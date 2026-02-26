import { z } from 'zod';
import { Item, ItemSummary } from '../../item';
import { GameState } from '../../state/GameState';
import { NpcSummary, isAlive } from '../../npc';
import { FlagEntry, FlagValue } from '../../flag';
import { Room } from '../../room';
import { AttackType } from '../../combat';
import { healthValueToProse } from '../../state/utils';
import { ItemSchema } from './schema';

export const toItemSummary = ({ world }: GameState, id: string): ItemSummary | null => {
    const item = world.items[id];
    if (!item) {
        return null;
    }
    const { name, shortDesc, type, useEffect, isHidden } = item;
    return { id, name, shortDesc, type, useEffect, isHidden };
};

export const toItemSchema = (item: Item): z.infer<typeof ItemSchema> => ({
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

export const toNpcSummary = ({ world }: GameState, id: string): NpcSummary | null => {
    const npc = world.npcs[id];
    if (!npc) return null;
    if (!isAlive(npc)) return { id, name: npc.name, isAlive: false };
    return {
        id,
        name: npc.name,
        isAlive: true,
        appearance: npc.appearance,
        mood: npc.mood,
        health: healthValueToProse(npc),
    };
};

export const getVisibleRoomItems = (state: GameState, room: Room): Array<ItemSummary & { quantity: number }> =>
    Object.entries(room.items)
        .map(([id, quantity]) => {
            const item = toItemSummary(state, id);
            if (!item || item.isHidden) return null;
            return { ...item, quantity };
        })
        .filter((i): i is ItemSummary & { quantity: number } => i !== null);

export const getRoomNpcs = (state: GameState, room: Room): NpcSummary[] =>
    room.npcIds.map((id) => toNpcSummary(state, id)).filter((n): n is NpcSummary => n !== null);

export const equipFieldForType = (type: 'weapon' | 'armor'): 'equippedWeapon' | 'equippedArmor' =>
    type === 'armor' ? 'equippedArmor' : 'equippedWeapon';

export const createFlagEntry = (
    key: string,
    value: FlagValue,
    turnCount: number,
    previousValue: FlagValue | null = null,
): FlagEntry => ({ key, value, setAtTurn: turnCount, previousValue });

export function rollAttack(attackPower: number, defense: number): { attackType: AttackType; damage: number } {
    const roll = Math.random();
    const baseDamage = Math.max(1, attackPower - defense);
    if (roll < 0.15) return { attackType: 'miss', damage: 0 };
    if (roll < 0.35) return { attackType: 'glancing', damage: Math.floor(baseDamage * 0.5) };
    if (roll > 0.9) return { attackType: 'critical', damage: Math.floor(baseDamage * 1.5) };
    return { attackType: 'hit', damage: baseDamage };
}

export function defeatEnemy(draft: GameState, enemyId: string, lootEntries: { item: Item; quantity: number }[]): void {
    const npc = draft.world.npcs[enemyId];
    draft.player.xp += npc.xpValue;
    draft.combat = null;

    const room = draft.world.rooms[draft.player.currentRoomId];
    for (const { item, quantity } of lootEntries) {
        room.items[item.id] = (room.items[item.id] ?? 0) + quantity;
    }
}
