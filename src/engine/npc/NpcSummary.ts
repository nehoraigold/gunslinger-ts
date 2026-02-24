import { HealthProse } from '../combat';

// Lightweight NPC summary returned in room listings
export interface NpcSummary {
    id: string;
    name: string;
    isHostile: boolean;
    healthProse: HealthProse; // Pre-computed by StateManager
    isEngaged: boolean;
    isAlive: boolean;
}
