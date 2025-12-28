import { Direction } from '../action';
import { GameState } from '../engine';
import { ReducerResult } from './reducer.result';

export const applyMove = (state: GameState, direction: Direction): ReducerResult => {
    const { player, world } = state;
    const currentRoom = world.rooms[player.currentRoomId];

    if (!currentRoom) {
        return {
            state,
            outcome: {
                result: 'invalid',
                reasons: ['current_room_not_found'],
            },
        };
    }

    const exit = currentRoom.exits[direction];
    if (!exit) {
        return {
            state,
            outcome: {
                result: 'no_change',
                reasons: ['no_exit'],
            },
        };
    }

    const nextRoom = world.rooms[exit.toRoomId];
    if (!nextRoom) {
        return {
            state,
            outcome: {
                result: 'invalid',
                reasons: ['next_room_not_found'],
            },
        };
    }

    const newState: GameState = {
        ...state,
        player: {
            ...player,
            currentRoomId: exit.toRoomId,
        },
        world: {
            ...world,
            rooms: {
                ...world.rooms,
                [exit.toRoomId]: {
                    ...nextRoom,
                    visited: true,
                },
            },
        },
    };
    return {
        state: newState,
        outcome: {
            result: 'success',
        },
    };
};
