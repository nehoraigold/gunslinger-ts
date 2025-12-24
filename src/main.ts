//region imports
import { ActionType, Direction } from './action';
import { RoomState } from './domain/room';
import { applyAction, GameState, initializeGameState } from './engine';
import { getUserInput } from './utils';
import { ActionInterpreter } from './interpreter/interperter';
import ora from 'ora';
//endregion

async function main() {
    let state = initializeGameState();
    const interpreter = new ActionInterpreter('gpt-oss:20b');

    while (true) {
        const room = getCurrentRoom(state);
        console.log(room.name, room.description);
        const input = await getUserInput('');
        const spinner = ora({ spinner: 'simpleDots' }).start();
        const action = await interpreter.parse(input, state);
        spinner.stop();
        console.log(JSON.stringify(action));
        if (action.type === ActionType.QUIT) {
            break;
        }
        state = applyAction(state, action);
    }
}

const getCurrentRoom = (gameState: GameState): RoomState => {
    const roomId = gameState.player.currentRoomId;
    const room = gameState.world.rooms[roomId];
    return room;
};

main();
