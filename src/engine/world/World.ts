import { Item } from '../item';
import { Room } from '../room';
import { Npc } from '../npc';
import { Quest } from '../quest';

export interface World {
    // Master registries. All entities live here.
    // Rooms, NPCs, and items are referenced by ID everywhere else.
    rooms: Record<string, Room>;
    npcs: Record<string, Npc>;
    items: Record<string, Item>;

    // All quests, active or otherwise
    quests: Record<string, Quest>;

    // World metadata
    name: string;
    version: string; // For save compatibility checks
}
