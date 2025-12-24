//region imports
import { ActionType, Direction } from './action';
import { RoomState } from './domain/room';
import { applyAction, GameState, initializeGameState } from './engine';
import { getUserInput } from './utils';
//endregion

async function main() {
    let state = initializeGameState();

    while (true) {
        console.log(state.player);
        console.log(getCurrentRoom(state));
        const input = await getUserInput('');
        if (input === 'quit') {
            break;
        }
        state = applyAction(state, { type: ActionType.MOVE, data: { direction: input as Direction } });
    }
}

const getCurrentRoom = (gameState: GameState): RoomState => {
    const roomId = gameState.player.currentRoomId;
    const room = gameState.world.rooms[roomId];
    return room;
};

main();
