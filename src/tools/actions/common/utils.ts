import { ItemSummary } from '../../../engine/item';
import { GameState } from '../../../engine/state/GameState';
import { NpcSummary } from '../../../engine/npc';
import { healthValueToProse } from '../../../engine/state/utils';

export const toItemSummary = ({ world }: GameState, id: string): ItemSummary | null => {
    const item = world.items[id];
    if (!item) {
        return null;
    }

    const { name, shortDesc, type, interactable, isHidden } = item;
    return { id, name, shortDesc, type, interactable, isHidden };
};

export const toNpcSummary = ({ world }: GameState, id: string): NpcSummary | null => {
    const npc = world.npcs[id];
    if (!npc) {
        return null;
    }
    const { name, mood, appearance, health, maxHealth } = npc;
    return { id, name, appearance, mood, health: healthValueToProse({ health, maxHealth }) };
};
