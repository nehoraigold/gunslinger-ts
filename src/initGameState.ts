import { Direction, Exit, LightLevel, Room } from './engine/room';
import { World } from './engine/world';
import { GameState } from './engine/state/GameState';
import { Player, PlayerStats } from './engine/player';
import { Npc } from './engine/npc';
import { Item } from './engine/item';

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

function buildItems(): Item[] {
    return [
        // ── Tavern ──────────────────────────────────────────────────────────────
        {
            id: 'item_bottle_01',
            name: 'Half-Empty Bottle',
            shortDesc: 'a sticky bottle of something amber',
            fullDescription:
                "A brown bottle, unlabeled. Whatever is inside smells like it was made in someone's cellar and shouldn't have been. About half remains.",
            type: 'consumable',
            useEffect: { type: 'heal', value: 20 },
            consumedOnUse: true,
            usageHint: undefined,
            secrets: [],
            weight: 1,
            value: 1,
            takeable: true,
            droppable: true,
            isHidden: false,
            createdAtTurn: 0,
        },
        {
            id: 'item_note_01',
            name: 'Crumpled Note',
            shortDesc: 'a scrap of paper left on a table',
            fullDescription:
                "Scrawled in a hurried hand: 'Do not go to the mill after dark. I mean it this time. — H'. The paper is old. H, whoever they were, is probably past caring.",
            type: 'lore',
            consumedOnUse: false,
            usageHint: undefined,
            secrets: [],
            weight: 0,
            value: 0,
            takeable: true,
            droppable: true,
            isHidden: false,
            createdAtTurn: 0,
        },

        // ── Forest Clearing ─────────────────────────────────────────────────────
        {
            id: 'item_knife_01',
            name: 'Hunting Knife',
            shortDesc: 'a bone-handled knife in the dirt',
            fullDescription:
                'A short hunting knife with a bone handle, worn smooth by use. The blade holds an edge. Someone dropped it in a hurry.',
            type: 'weapon',
            stats: { damage: 4, defense: 0, speedModifier: 1.1 },
            consumedOnUse: false,
            usageHint: undefined,
            secrets: [],
            weight: 1,
            value: 8,
            takeable: true,
            droppable: true,
            isHidden: false,
            createdAtTurn: 0,
        },

        // ── Graveyard ───────────────────────────────────────────────────────────
        {
            id: 'item_lantern_01',
            name: 'Rusted Lantern',
            shortDesc: 'a dented iron lantern, unlit',
            fullDescription:
                'An old iron lantern, dented and rusted at the hinge. The glass is cracked but intact. It has no oil — useless as it is, but fixable.',
            type: 'misc',
            consumedOnUse: false,
            usageHint: 'It would need oil before it could be lit.',
            secrets: [],
            weight: 2,
            value: 3,
            takeable: true,
            droppable: true,
            isHidden: false,
            createdAtTurn: 0,
        },
        {
            id: 'item_iron_key_01',
            name: 'Iron Key',
            shortDesc: 'a heavy key buried in the soil',
            fullDescription:
                'A heavy iron key, blackened with age. It was buried just below the surface near the newest grave — deliberately, it seems. The head is stamped with a mill wheel.',
            type: 'key',
            useEffect: { type: 'unlock', flagKey: 'mill_door_unlocked' },
            consumedOnUse: true,
            usageHint: 'The stamp on the head looks like a mill wheel.',
            secrets: [],
            weight: 1,
            value: 0,
            takeable: true,
            droppable: true,
            isHidden: true,
            createdAtTurn: 0,
        },
    ];
}

// =============================================================================
// NPCS
// Tavern [1,1]         — Mira (bartender, neutral)
// Village Square [1,0] — Old Edwyn (elder, friendly)
// Graveyard [2,2]      — Restless Corpse (hostile)
// =============================================================================

function buildNpcs(): Npc[] {
    return [
        // ── Mira — Tavern ────────────────────────────────────────────────────────
        {
            id: 'npc_mira_01',
            name: 'Mira',
            appearance:
                'A stocky woman in her fifties, grey-streaked hair pulled back. Her hands never stop moving — wiping the bar, stacking cups, finding work.',
            personality:
                'Tired innkeeper who has seen too much. Helpful because it is easier than arguing. Dry humour. Protective of her regulars.',

            isHostile: false,
            health: 40,
            maxHealth: 40,
            attackPower: 3,
            defense: 1,
            agility: 5,

            mood: 'neutral',
            knowledgeTopics: [
                {
                    topic: 'village_history',
                    content: 'The village used to be larger. People left after the mill closed.',
                },
                {
                    topic: 'old_mill',
                    content: 'The mill stopped working two years ago. No one goes there now, especially not at night.',
                },
                {
                    topic: 'graveyard',
                    content: 'Henrik the miller was buried last month. Died in the mill. Officially an accident.',
                },
                {
                    topic: 'iron_key',
                    content: 'She knows nothing about a key, but knows the newest grave belongs to Henrik.',
                },
            ],
            dialogueHints: [
                { hint: 'Speaks plainly. Shares what she knows if asked directly.' },
                { hint: 'Deflects any questions about what exactly happened to Henrik.' },
            ],
            dialogueNodes: {
                initial: {
                    id: 'initial',
                    description: 'First meeting. Politely cautious with a stranger.',
                    unlocksTopics: ['village_history', 'old_mill', 'graveyard'],
                },
            },
            currentDialogueNode: 'initial',

            inventory: [],
            gold: 15,
            lootTable: [],
            visibleEquipment: ['worn apron', 'small belt knife'],
            notableFeatures: [
                { feature: 'A faded bruise along her jaw — a few days old.' },
                { feature: 'She glances at the door whenever it opens.' },
            ],
            isAlive: true,
            isEngaged: false,
            reactsToObservation: false,
            xpValue: 0,
        },

        // ── Old Edwyn — Village Square ───────────────────────────────────────────
        {
            id: 'npc_edwyn_01',
            name: 'Old Edwyn',
            appearance:
                'A thin man, very old, seated on a stone bench with a walking stick across his knees. His eyes are sharp despite everything else.',
            personality:
                'Village elder. Remembers everything. Speaks in considered sentences. Genuinely wants to help but is afraid of something he will not name.',

            isHostile: false,
            health: 20,
            maxHealth: 20,
            attackPower: 1,
            defense: 0,
            agility: 2,

            mood: 'friendly',
            knowledgeTopics: [
                { topic: 'village_history', content: 'The village was founded by three families. Only one remains.' },
                {
                    topic: 'old_mill',
                    content:
                        "The mill was Henrik's life. He found something in the millstone chamber and would not say what.",
                },
                {
                    topic: 'iron_key',
                    content:
                        'Henrik told Edwyn he had hidden something important near his grave, for whoever needs it next.',
                },
                { topic: 'graveyard', content: 'Henrik asked to be buried facing the mill. Edwyn honoured that.' },
                {
                    topic: 'restless_dead',
                    content:
                        'Three nights ago something dug up the south corner of the graveyard. Edwyn has not told anyone.',
                },
            ],
            dialogueHints: [
                { hint: 'Warm and forthcoming about history. Evasive about recent events — clearly frightened.' },
                {
                    hint: "Will mention the iron key if asked about Henrik or the graveyard, but won't say what it unlocks.",
                },
                {
                    hint: 'Will only hint at the restless dead if the player has already visited the graveyard.',
                    condition: { type: 'flag', key: 'room_2_2_visited', value: true },
                },
            ],
            dialogueNodes: {
                initial: {
                    id: 'initial',
                    description: 'Greeting a stranger. Cautiously hopeful.',
                    unlocksTopics: ['village_history', 'old_mill', 'graveyard', 'iron_key'],
                },
                post_graveyard: {
                    id: 'post_graveyard',
                    description: 'Player has visited the graveyard. Edwyn is relieved someone is looking into it.',
                    unlocksTopics: ['restless_dead'],
                },
            },
            currentDialogueNode: 'initial',

            inventory: [],
            gold: 3,
            lootTable: [],
            visibleEquipment: ['walking stick', 'patched coat'],
            notableFeatures: [
                { feature: 'His hands have a faint tremor when he speaks about the mill.' },
                { feature: 'He keeps glancing south, toward the graveyard.' },
            ],
            isAlive: true,
            isEngaged: false,
            reactsToObservation: false,
            xpValue: 0,
        },

        // ── Restless Corpse — Graveyard ──────────────────────────────────────────
        {
            id: 'npc_corpse_01',
            name: 'Restless Corpse',
            appearance:
                'A figure that should not be standing. Burial clothes, grave soil still clinging to it, moving with the lurching certainty of something that has forgotten how bodies work.',
            personality: 'No personality. No speech. It moves toward the living with a single, dull intent.',

            isHostile: true,
            health: 25,
            maxHealth: 25,
            attackPower: 7,
            defense: 2,
            agility: 4,

            mood: 'hostile',
            knowledgeTopics: [],
            dialogueHints: [{ hint: 'Cannot speak. Will not respond to dialogue. Attacks on sight.' }],
            dialogueNodes: {
                initial: {
                    id: 'initial',
                    description: 'Hostile. No dialogue possible.',
                    unlocksTopics: [],
                },
            },
            currentDialogueNode: 'initial',

            inventory: [],
            gold: 0,
            lootTable: [],
            visibleEquipment: ['tattered burial shroud'],
            notableFeatures: [
                { feature: 'The grave it crawled from is in the south corner — the soil is freshly turned.' },
                { feature: 'It does not breathe.' },
            ],
            isAlive: true,
            isEngaged: false,
            reactsToObservation: true,
            xpValue: 30,
        },
    ];
}

// =============================================================================
// PLACEMENT
// =============================================================================

const ITEM_PLACEMENTS: Record<string, Coord> = {
    item_bottle_01: [1, 1],
    item_note_01: [1, 1],
    item_knife_01: [0, 0],
    item_lantern_01: [2, 2],
    item_iron_key_01: [2, 2],
};

const NPC_PLACEMENTS: Record<string, Coord> = {
    npc_mira_01: [1, 1],
    npc_edwyn_01: [1, 0],
    npc_corpse_01: [2, 2],
};

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

    const items: World['items'] = {};
    for (const item of buildItems()) {
        items[item.id] = item;
        const coord = ITEM_PLACEMENTS[item.id];
        if (coord) rooms[roomId(...coord)].items[item.id] = 1;
    }

    const npcs: World['npcs'] = {};
    for (const npc of buildNpcs()) {
        npcs[npc.id] = npc;
        const coord = NPC_PLACEMENTS[npc.id];
        if (coord) rooms[roomId(...coord)].npcIds.push(npc.id);
    }

    rooms[roomId(2, 2)].isSafeRoom = false;
    const startingRoomId = roomId(1, 1); // The Guttered Candle
    rooms[startingRoomId].visited = true;

    const world: World = {
        rooms,
        npcs,
        items,
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
