import { formatToHeader, getLogger, getUserInput, Print } from './utils';
import { GameStorage } from './engine/meta/GameStorage';
import { initGameState } from './initGameState';
import { StateManager } from './engine/state/StateManager';
import { GameState } from './engine/state/GameState';
import { actionRegistry, resolveActionName } from './engine/actions/actionRegistry';

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
    const [cmd, ...tokens] = input.split(' ');
    const name = resolveActionName(cmd);
    if (!name) throw new Error(`Unknown action: ${cmd}`);
    const { action, parseCli } = actionRegistry[name];
    return action.execute(state, parseCli ? parseCli(tokens) : undefined);
}

main();
