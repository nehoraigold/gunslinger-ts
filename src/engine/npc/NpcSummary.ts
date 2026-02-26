import { HealthProse } from '../combat';
import { NpcMood } from './NpcMood';

export type NpcSummary =
    | { id: string; name: string; isAlive: true; appearance: string; mood: NpcMood; health: HealthProse }
    | { id: string; name: string; isAlive: false };
