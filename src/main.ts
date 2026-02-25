import { formatToHeader, getLogger, getUserInput, Print } from './utils';
import { GameStorage } from './engine/meta/GameStorage';
import { initGameState } from './initGameState';
import { Direction } from './engine/room';
import { StateManager } from './engine/state/StateManager';
import { GameState } from './engine/state/GameState';
import { MoveAction } from './engine/actions/move';
import { LookRoomAction } from './engine/actions/lookRoom';
import { LookNpcAction } from './engine/actions/lookNpc';
import { LookItemAction } from './engine/actions/lookItem';
import { LookExitAction } from './engine/actions/lookExit';
import { CheckInventoryAction } from './engine/actions/checkInventory';
import { PickUpAction } from './engine/actions/pickUp';

const log = getLogger('main');

async function main() {
    const storage = new GameStorage('./saves');
    const stateManager = new StateManager(initGameState());
    let input = '';
    while (input !== 'q') {
        const state = stateManager.beginTransaction();
        const room = state.world.rooms[state.player.currentRoomId];
        Print.Message(formatToHeader(`${room.name} (${room.id})`));

        input = await getUserInput();
        if (input === 'q' || input === 'quit') {
            break;
        }

        let { state: nextState, outcome } = takeAction(state, input);
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

function takeAction(state: GameState, input: string): { state?: GameState; outcome: any } {
    const [action, ...inputs] = input.split(' ');
    switch (action) {
        case 'move':
            return MoveAction.execute(state, { direction: inputToDirection(inputs.join(' ')) });
        case 'lookRoom':
        case 'look':
            return LookRoomAction.execute(state);
        case 'lookNpc':
            return LookNpcAction.execute(state, { npcId: inputs.join(' ') });
        case 'lookItem':
            return LookItemAction.execute(state, { itemId: inputs.join(' ') });
        case 'lookExit':
            return LookExitAction.execute(state, { direction: inputToDirection(inputs.join(' ')) });
        case 'checkInventory':
        case 'inventory':
        case 'i':
            return CheckInventoryAction.execute(state);
        case 'pickUp':
            return PickUpAction.execute(state, { itemId: inputs[0], quantity: parseInt(inputs[1] ?? '1') });
        default:
            throw new Error(`Unknown action: ${action}`);
    }
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
