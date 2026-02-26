import { Npc } from './Npc';

export const isAlive = (npc: Npc): boolean => npc.health > 0;
export const isHostile = (npc: Npc): boolean => npc.mood === 'hostile';
