import { ActiveEffect } from './ActiveEffect';
import { PlayerStats } from './PlayerStats';

export interface Player {
    id: string; // Always "player" in single-player

    // Position
    currentRoomId: string;

    // Health
    health: number;
    maxHealth: number;

    // Stats
    stats: PlayerStats;
    baseStats: PlayerStats; // Before equipment modifiers. StateManager derives stats from this.

    // Inventory
    inventory: Record<string, number>; // Item ID -> quantity
    equippedWeapon: string | null;
    equippedArmor: string | null;

    // Resources
    gold: number;

    // Experience (placeholder — no level system yet)
    xp: number;
    level: number;

    // Active effects
    activeEffects: ActiveEffect[];

    // Health history for trend tracking (ring buffer, last 10 values)
    healthHistory: number[];

    // Flags that affect player-specific behavior
    // e.g. "is_cursed", "has_darkvision"
    traits: string[];
}
