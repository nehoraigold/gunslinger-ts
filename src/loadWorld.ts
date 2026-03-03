import { readFileSync, readdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { GameState } from './engine/state/GameState';
import { Player } from './engine/player';
import { Room } from './engine/room';
import { Item } from './engine/item';
import { Npc } from './engine/npc';

// Resolve world/ relative to the bundle location (dist/index.js → ../world)
const WORLD_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'world');

function readJsonDir<T>(dir: string): T[] {
    const results: T[] = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
            results.push(...readJsonDir<T>(fullPath));
        } else if (entry.name.endsWith('.json')) {
            results.push(JSON.parse(readFileSync(fullPath, 'utf-8')) as T);
        }
    }
    return results;
}

export function loadWorld(playerName: string = 'Stranger'): GameState {
    const rooms: Record<string, Room> = {};
    for (const room of readJsonDir<Room>(join(WORLD_DIR, 'rooms'))) {
        rooms[room.id] = room;
    }

    const items: Record<string, Item> = {};
    for (const item of readJsonDir<Item>(join(WORLD_DIR, 'items'))) {
        items[item.id] = item;
    }

    const npcs: Record<string, Npc> = {};
    for (const npc of readJsonDir<Npc>(join(WORLD_DIR, 'npcs'))) {
        npcs[npc.id] = npc;
    }

    const playerTemplate = JSON.parse(readFileSync(join(WORLD_DIR, 'player.json'), 'utf-8')) as Player;
    const player: Player = { ...playerTemplate, name: playerName };

    return {
        player,
        world: {
            rooms,
            npcs,
            items,
            quests: {},
            name: 'Tull',
            version: '1.0.0',
        },
        flags: {},
        combat: null,
        turnCount: 0,
    };
}
