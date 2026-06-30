import { GameState } from './GameState';
import { PlayerState } from './player';
import { ItemState } from './item';
import { RoomState } from './room';

const player: PlayerState = {
    id: 'player',
    name: 'Roland',
    currentRoomId: '',
    equipment: {
        weapon: undefined,
        armor: undefined,
    },
};

const sword: ItemState = {
    name: 'Sword',
    description: 'A normal sword',
    type: 'weapon',
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
};

const initialState: GameState = {
    player,
    items: {
        sword_1: sword,
    },
    rooms: {
        room_1: room1,
        room_2: room2,
    },
};

export const createGameState = (state?: GameState) => {
    return {
        ...initialState,
        ...state,
    };
};
