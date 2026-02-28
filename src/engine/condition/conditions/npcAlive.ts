import { isAlive } from '../../npc';
import { GameState } from '../../state/GameState';

/** NPC exists and has health > 0. */
export type NpcAliveCondition = { type: 'npc_alive'; npcId: string };

export const evalNpcAlive = ({ world }: GameState, { npcId }: NpcAliveCondition): boolean => {
    const npc = world.npcs[npcId];
    return npc ? isAlive(npc) : false;
};
