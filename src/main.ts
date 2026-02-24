import { formatToHeader, getLogger, getUserInput, Print } from './utils';
import { GameStorage } from './engine/meta/GameStorage';
import { initGameState } from './initGameState';
import { move } from './tools/actions/move';
import { Direction } from './engine/room';
import { StateManager } from './engine/state/StateManager';

const log = getLogger('main');

async function main() {
    const storage = new GameStorage('./saves');
    const stateManager = new StateManager((await storage.load('1')) ?? initGameState());
    let input = '';
    while (input !== 'q') {
        const state = stateManager.beginTransaction();
        const room = state.world.rooms[state.player.currentRoomId];
        Print.Message(formatToHeader(`${room.name} (${room.id})`));
        input = await getUserInput();
        if (input === 'q' || input === 'quit') {
            break;
        }
        let { state: nextState, outcome } = move(state, { direction: inputToDirection(input) });
        Print.Message(`Outcome: ${JSON.stringify(outcome, null, 2)}`);
        if (nextState) {
            stateManager.commit(nextState);
        } else {
            stateManager.rollback();
        }
    }
    await storage.save('1', stateManager.getState());
    Print.Message('Goodbye!');
}

function inputToDirection(input: string): Direction {
    switch (input) {
        case 'n':
            return 'north';
        case 'e':
            return 'east';
        case 'w':
            return 'west';
        case 's':
            return 'south';
        case 'u':
            return 'up';
        case 'd':
            return 'down';
        default:
            return '' as Direction;
    }
}

main();
