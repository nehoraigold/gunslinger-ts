import { NpcMood } from '../../npc/NpcMood';
import { GameState } from '../../state/GameState';

/** NPC exists and has the given mood. */
export type NpcMoodCondition = { type: 'npc_mood'; npcId: string; mood: NpcMood };

export const evalNpcMood = ({ world }: GameState, { npcId, mood }: NpcMoodCondition): boolean => {
    const npc = world.npcs[npcId];
    return npc ? npc.mood === mood : false;
};
