import { Direction, Exit, LightLevel, Room } from './engine/room';
import { World } from './engine/world';
import { GameState } from './engine/state/GameState';
import { Player, PlayerStats } from './engine/player';

// =============================================================================
// 3x3 WORLD LAYOUT
//
//  [0,0] Forest Clearing  — [0,1] Crumbling Bridge  — [0,2] Eastern Bluff
//        |                        |                          |
//  [1,0] Village Square   — [1,1] The Guttered Candle— [1,2] Village Well
//        |                        |                          |
//  [2,0] Southern Gate    — [2,1] Old Mill           — [2,2] Graveyard
//
// Player starts at [1,1] — the tavern.
// =============================================================================

type Coord = [row: number, col: number];

interface RoomDef {
    name: string;
    description: string;
    lightLevel: LightLevel;
}

const ROOM_DEFS: RoomDef[][] = [
    // Row 0 (north)
    [
        {
            name: 'Forest Clearing',
            description:
                "A ragged clearing at the forest's edge. The trees press in on three sides. Birdsong, but nothing else.",
            lightLevel: 'bright',
        },
        {
            name: 'Crumbling Bridge',
            description:
                'A stone bridge over a fast-moving stream. Half the parapet has collapsed into the water below.',
            lightLevel: 'bright',
        },
        {
            name: 'Eastern Bluff',
            description:
                'A rocky outcrop overlooking the village. The drop to the east is sheer. The view is not worth the climb.',
            lightLevel: 'bright',
        },
    ],
    // Row 1 (middle)
    [
        {
            name: 'Village Square',
            description:
                'A square of packed dirt, ringed by shuttered stalls. A well sits dry in the center. No one is out.',
            lightLevel: 'bright',
        },
        {
            name: 'The Guttered Candle',
            description:
                'Low smoke, lower ceiling. A tavern that has outlasted its ambitions. The smell of tallow and old ale.',
            lightLevel: 'dim',
        },
        {
            name: 'Village Well',
            description:
                'A stone well behind the tavern. The rope is frayed. Someone has scratched marks into the coping — tallies, maybe.',
            lightLevel: 'bright',
        },
    ],
    // Row 2 (south)
    [
        {
            name: 'Southern Gate',
            description:
                "The village's southern entrance. The gate stands open — it has not been closed in years. The road beyond leads nowhere good.",
            lightLevel: 'bright',
        },
        {
            name: 'Old Mill',
            description:
                'A watermill gone still. The wheel has not turned in seasons. The interior smells of rot and grain dust.',
            lightLevel: 'dim',
        },
        {
            name: 'Graveyard',
            description:
                'Crooked headstones on a low hill. The newest grave has no name. The soil around it looks recently disturbed.',
            lightLevel: 'bright',
        },
    ],
];

// =============================================================================
// GRID HELPERS
// =============================================================================

function roomId(row: number, col: number): string {
    return `room_${row}_${col}`;
}

// Returns the [row, col] neighbor in a given direction, or null if out of bounds
function neighbor(row: number, col: number, direction: Direction): Coord | null {
    const deltas: Record<Direction, Coord> = {
        north: [-1, 0],
        south: [1, 0],
        west: [0, -1],
        east: [0, 1],
        up: [0, 0], // unused in this world
        down: [0, 0], // unused in this world
    };
    const [dr, dc] = deltas[direction];
    const nr = row + dr;
    const nc = col + dc;
    if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE) return null;
    return [nr, nc];
}

const GRID_SIZE = 3;
const CARDINAL: Direction[] = ['north', 'south', 'east', 'west'];

// =============================================================================
// ROOM BUILDER
// =============================================================================

function buildRoom(row: number, col: number): Room {
    const def = ROOM_DEFS[row][col];

    const exits: Exit[] = CARDINAL.reduce<Exit[]>((acc, dir) => {
        const dest = neighbor(row, col, dir);
        if (!dest) return acc;
        const [dr, dc] = dest;
        acc.push({
            direction: dir,
            destinationRoomId: roomId(dr, dc),
            isBlocked: false,
            blockReason: undefined,
            description: `A path leads ${dir}.`,
            destinationKnown: true,
            hint: undefined,
            unlockCondition: undefined,
        });
        return acc;
    }, []);

    return {
        id: roomId(row, col),
        name: def.name,
        description: def.description,
        exits,
        items: {},
        npcIds: [],
        visited: false,
        lastLookedAtTurn: undefined,
        ambientDetails: [],
        isSafeRoom: true,
        lightLevel: def.lightLevel,
    };
}

// =============================================================================
// INIT
// =============================================================================

export function initGameState(): GameState {
    // Build room registry
    const rooms: World['rooms'] = {};
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const room = buildRoom(row, col);
            rooms[room.id] = room;
        }
    }

    const startingRoomId = roomId(1, 1); // The Guttered Candle
    rooms[startingRoomId].visited = true;

    const world: World = {
        rooms,
        npcs: {},
        items: {},
        quests: {},
        name: 'The Unnamed Village',
        version: '1.0.0',
    };

    const baseStats: PlayerStats = {
        strength: 10,
        agility: 10,
        intelligence: 10,
        endurance: 10,
    };

    const player: Player = {
        id: 'player',
        currentRoomId: startingRoomId,
        health: 100,
        maxHealth: 100,
        stats: { ...baseStats },
        baseStats: { ...baseStats },
        inventory: {},
        equippedWeapon: null,
        equippedArmor: null,
        gold: 10,
        xp: 0,
        level: 1,
        activeEffects: [],
        healthHistory: [100],
        traits: [],
    };

    // const meta: GameMeta = {
    //     sessionId: randomUUID(),
    //     startedAtTimestamp: Date.now(),
    //     totalPlaytimeMs: 0,
    //     turnCount: 0,
    //     lastSavedTurn: undefined,
    //     debugMode: false,
    // };

    return {
        // meta,
        player,
        world,
        flags: {},
        combat: null,
        turnCount: 0,
    };
}
