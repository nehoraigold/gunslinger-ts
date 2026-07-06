import { GameState } from './GameState';
import { PlayerState } from './player';
import { ItemState } from './item';
import { NpcState } from './npc';
import { RoomState } from './room';

const player: PlayerState = {
    id: 'player',
    name: 'Player',
    currentRoomId: 'room_1',
    equipment: {
        weapon: undefined,
        armor: undefined,
    },
    inventory: {},
};

const item1: ItemState = {
    name: 'Item 1',
    description: 'The first item',
    type: 'weapon',
    stackable: false,
};

const item2: ItemState = {
    name: 'Item 2',
    description: 'The second item',
    type: 'consumable',
    stackable: true,
};

const npc1: NpcState = {
    name: 'Npc 1',
    appearance: 'The first npc',
    dialogue: 'Well met.',
};

const npc2: NpcState = {
    name: 'Npc 2',
    appearance: 'The second npc',
    dialogue: 'Move along.',
};

const room1: RoomState = {
    name: 'Room 1',
    description: 'The first room',
    lightLevel: 'bright',
    visited: false,
    exits: [
        {
            direction: 'west',
            destinationRoomId: 'room_2',
        },
    ],
    inventory: {},
    npcIds: [],
};

const room2: RoomState = {
    name: 'Room 2',
    description: 'The second room',
    lightLevel: 'bright',
    visited: false,
    exits: [
        {
            direction: 'east',
            destinationRoomId: 'room_1',
        },
    ],
    inventory: {},
    npcIds: [],
};

const initialState: GameState = {
    player,
    items: {
        item_1: item1,
        item_2: item2,
    },
    npcs: {
        npc_1: npc1,
        npc_2: npc2,
    },
    rooms: {
        room_1: room1,
        room_2: room2,
    },
};

export type ModifyState = Partial<GameState> | ((s: GameState) => GameState | void);

export const createGameState = (modifyState?: ModifyState) => {
    const state = structuredClone(initialState);
    if (typeof modifyState === 'function') {
        modifyState(state);
        return state;
    }
    return {
        ...state,
        ...modifyState,
    };
};
