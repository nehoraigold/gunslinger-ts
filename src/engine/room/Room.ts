import { AmbientDetail } from './AmbientDetail';
import { Exit } from './Exit';
import { LightLevel } from './LightLevel';

export interface Room {
    id: string;
    name: string;
    description: string; // Full atmosphere text. Authored.

    exits: Exit[];
    items: Record<string, number>; // Item ID -> quantity
    npcIds: string[]; // IDs referencing world.npcs registry

    // Whether the player has ever entered this room
    visited: boolean;

    // Last turn lookRoom() was called in this room.
    // Used for ambient detail rotation.
    lastLookedAtTurn?: number;

    // Rotating sensory details. StateManager picks one based on
    // lastLookedAtTurn and conditions.
    ambientDetails: AmbientDetail[];

    // Whether this room is safe for resting (no hostile NPC spawn)
    isSafeRoom: boolean;

    // Light level affects item visibility
    // In "dark": isHidden is forced true for all items, exit descriptions are vague
    lightLevel: LightLevel;

    // Metadata
    createdAtTurn?: number; // For procedurally generated rooms (future)
}
