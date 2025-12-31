import { GameState } from '../src/engine';
import { WorldState } from '../src/domain/world';
import { RoomState } from '../src/domain/room';
import { InventoryState } from '../src/domain/inventory';
import { NPCState } from '../src/domain/npc';
import { ItemState } from '../src/domain/item';

export const ROOMS: RoomState[] = [
    {
        id: 'room-town-square',
        name: 'Town Square',
        description: 'A dusty town square with a fountain in the middle.',
        visited: false,
        exits: {
            north: { toRoomId: 'room-saloon' },
            east: { toRoomId: 'room-main-street' },
        },
        inventoryId: 'inv-room-town-square',
        npcIds: [],
    },
    {
        id: 'room-saloon',
        name: 'The Saloon',
        description: 'A noisy saloon filled with rowdy patrons and the smell of whiskey.',
        visited: false,
        exits: {
            south: { toRoomId: 'room-town-square' },
        },
        inventoryId: 'inv-room-saloon',
        npcIds: ['npc-bartender'],
    },
    {
        id: 'room-main-street',
        name: 'Main Street',
        description: 'The main street of town, lined with a few wooden storefronts.',
        visited: false,
        exits: {
            west: { toRoomId: 'room-town-square' },
        },
        inventoryId: 'inv-room-main-street',
        npcIds: [],
    },
];

export const INVENTORIES: InventoryState[] = [
    {
        id: 'inv-player',
        items: {
            'item-revolver': 1,
            'item-bullet': 6,
            'item-coin': 19,
        },
    },
    {
        id: 'inv-room-town-square',
        items: {
            'item-horseshoe': 1,
            'item-coin': 1,
        },
    },
    {
        id: 'inv-room-saloon',
        items: {
            'item-coin': 3,
        },
    },
    {
        id: 'inv-room-main-street',
        items: {
            'item-coin': 12,
        },
    },
    {
        id: 'inv-npc-bartender',
        items: {
            'item-revolver': 1,
            'item-coin': 200,
        },
    },
];

const NPCS: NPCState[] = [
    {
        id: 'npc-bartender',
        name: 'Kennerly',
        aliases: ['barman', 'man', 'old man', 'bartender'],
        description: 'A wrinkled old man with a mustached wipes a dirty glass behind the bar.',
        inventoryId: 'inv-npc-bartender',
    },
];

const ITEMS: ItemState[] = [
    {
        id: 'item-revolver',
        name: 'revolver',
        aliases: ['gun', 'revolver', 'firearm'],
        description: 'A worn revolver with a sandalwood grip passed down from father to son for generations.',
    },
    {
        id: 'item-bullet',
        name: 'bullet',
        aliases: ['bullet', 'shell'],
        description: 'A silver bullet made for old revolvers. Hard to come by, harder to recover from.',
    },
    {
        id: 'item-horseshoe',
        name: 'horseshoe',
        aliases: [],
        description: 'An iron horseshoe, bent and mangled, said to offer good luck to its bearer.',
    },
    {
        id: 'item-coin',
        name: 'coin',
        aliases: ['gold', 'money'],
        description: 'An old coin made of gold.',
    },
];

export const INITIAL_PLAYER = {
    name: 'Roland',
    inventoryId: 'inv-player',
    description: 'A lean gunslinger with a weathered hat and steady eyes.',
    currentRoomId: 'room-town-square',
};

const toMap = <T extends { id: string }>(arr: T[]): Record<string, T> =>
    Object.fromEntries(arr.map((item) => [item.id, item]));

export const INITIAL_WORLD: WorldState = {
    rooms: toMap(ROOMS),
    inventories: toMap(INVENTORIES),
    items: toMap(ITEMS),
    npcs: toMap(NPCS),
};

export const INITIAL_GAME_STATE: GameState = {
    player: INITIAL_PLAYER,
    world: INITIAL_WORLD,
};

export const testGameState = (): GameState => {
    return INITIAL_GAME_STATE;
};
