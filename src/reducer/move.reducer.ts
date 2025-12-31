import { Direction } from '../action';
import { GameState } from '../engine';
import { ReducerResult } from './reducer.result';
import { evaluateCondition } from '../engine/condition';

export const applyMove = (state: GameState, direction: Direction): ReducerResult => {
    const { player, world } = state;
    const currentRoom = world.rooms[player.currentRoomId];

    if (!currentRoom) {
        return {
            state,
            outcome: {
                result: 'error',
                reasons: [{ message: 'current_room_not_found' }],
            },
        };
    }

    const exitId = currentRoom.exits[direction];
    if (!exitId) {
        return {
            state,
            outcome: {
                result: 'failure',
                reasons: [{ message: 'no_exit' }],
            },
        };
    }

    const exitState = world.exits[exitId];
    if (!exitState) {
        return {
            state,
            outcome: {
                result: 'error',
                reasons: [{ message: 'exit_not_found' }],
            },
        };
    }

    const isVisible = evaluateCondition(state, exitState.visibility);
    if (!isVisible.ok) {
        return {
            state,
            outcome: {
                result: 'failure',
                reasons: isVisible.reasons,
            },
        };
    }

    const isEligible = evaluateCondition(state, exitState.eligibility);
    if (!isEligible.ok) {
        return {
            state,
            outcome: {
                result: 'failure',
                reasons: isEligible.reasons,
            },
        };
    }

    const nextRoom = world.rooms[exitState.toRoomId];
    if (!nextRoom) {
        return {
            state,
            outcome: {
                result: 'error',
                reasons: [{ message: 'next_room_not_found' }],
            },
        };
    }

    const newState: GameState = {
        ...state,
        player: {
            ...player,
            currentRoomId: exitState.toRoomId,
        },
        world: {
            ...world,
            rooms: {
                ...world.rooms,
                [nextRoom.id]: {
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
