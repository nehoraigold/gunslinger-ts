import { ItemSummary } from '../../item';
import { GameState } from '../../state/GameState';
import { NpcSummary } from '../../npc';
import { healthValueToProse } from '../../state/utils';

export const toItemSummary = ({ world }: GameState, id: string): ItemSummary | null => {
    const item = world.items[id];
    if (!item) {
        return null;
    }

    const { name, shortDesc, type, useEffect, isHidden } = item;
    return { id, name, shortDesc, type, useEffect, isHidden };
};

export const toNpcSummary = ({ world }: GameState, id: string): NpcSummary | null => {
    const npc = world.npcs[id];
    if (!npc) {
        return null;
    }
    const { name, mood, appearance, health, maxHealth } = npc;
    return { id, name, appearance, mood, health: healthValueToProse({ health, maxHealth }) };
};
