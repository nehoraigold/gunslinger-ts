import { HealthProse } from '../combat';
import { NpcMood } from './NpcMood';

// Lightweight NPC summary returned in room listings
export interface NpcSummary {
    id: string;
    name: string;
    appearance: string;
    mood: NpcMood;
    health: HealthProse; // Pre-computed by StateManager
}
