import { Direction } from '../action';
import { GameState } from '../engine';

export const applyMove = (gameState: GameState, direction: Direction): GameState => {
    const { player, world } = gameState;
    const currentRoom = world.rooms[player.currentRoomId];

    if (!currentRoom) {
        // Invalid state — fail safely
        return gameState;
    }

    const exit = currentRoom.exits[direction];
    if (!exit) {
        // No exit in that direction
        return gameState;
    }

    //   if (exit.condition && !evaluateCondition(exit.condition, gameState)) {
    //     // Exit exists but is blocked
    //     return gameState;
    //   }

    const nextRoom = world.rooms[exit.toRoomId];
    if (!nextRoom) {
        ``;
        // Broken world graph — still fail safely
        return gameState;
    }

    return {
        ...gameState,
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
};
