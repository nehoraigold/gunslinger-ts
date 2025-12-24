import { RoomState, ExitState } from '../domain/room';
import { GameState } from './game.state';
import { InventoryState } from '../domain/inventory';

export const ROOMS: Record<string, RoomState> = {
    'room-town-square': {
        id: 'room-town-square',
        name: 'Town Square',
        description: 'A dusty town square with a fountain in the middle.',
        visited: false,
        exits: {
            north: { toRoomId: 'room-saloon' },
            east: { toRoomId: 'room-main-street' },
        },
        inventoryIds: ['inv-room-town-square'],
        npcIds: [],
    },
    'room-saloon': {
        id: 'room-saloon',
        name: 'The Saloon',
        description: 'A noisy saloon filled with rowdy patrons and the smell of whiskey.',
        visited: false,
        exits: {
            south: { toRoomId: 'room-town-square' },
        },
        inventoryIds: [],
        npcIds: ['npc-bartender'],
    },
    'room-main-street': {
        id: 'room-main-street',
        name: 'Main Street',
        description: 'The main street of town, lined with a few wooden storefronts.',
        visited: false,
        exits: {
            west: { toRoomId: 'room-town-square' },
        },
        inventoryIds: [],
        npcIds: [],
    },
};

export const INVENTORIES: Record<string, InventoryState> = {
    'inv-player': {
        id: 'inv-player',
        items: {
            'item-revolver': 1,
            'item-bullet': 6,
        },
    },
    'inv-room-town-square': {
        id: 'inv-room-town-square',
        items: {
            'item-horseshoe': 1,
        },
    },
};

export const INITIAL_PLAYER = {
    name: 'Roland',
    inventoryId: 'inv-player',
    description: 'A lean gunslinger with a weathered hat and steady eyes.',
    currentRoomId: 'room-town-square',
};

export const INITIAL_WORLD = {
    rooms: ROOMS,
    inventories: INVENTORIES,
};

export const INITIAL_GAME_STATE: GameState = {
    player: INITIAL_PLAYER,
    world: INITIAL_WORLD,
};

export const initializeGameState = (): GameState => {
    return INITIAL_GAME_STATE;
};
