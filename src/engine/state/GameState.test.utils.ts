import { GameState } from './GameState';
import { PlayerState } from './player';
import { ItemState } from './item';
import { RoomState } from './room';

const player: PlayerState = {
    id: 'player',
    name: 'Roland',
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

const room1: RoomState = {
    name: 'Room 1',
    description: 'The first room',
    exits: [
        {
            direction: 'west',
            destinationRoomId: 'room_2',
        },
    ],
    inventory: {},
};

const room2: RoomState = {
    name: 'Room 2',
    description: 'The second room',
    exits: [
        {
            direction: 'east',
            destinationRoomId: 'room_1',
        },
    ],
    inventory: {},
};

const initialState: GameState = {
    player,
    items: {
        item_1: item1,
        item_2: item2,
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
