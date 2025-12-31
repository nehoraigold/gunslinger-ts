import ora from 'ora';
import { Action, ActionType, ResolvedAction } from './action';
import { applyAction, GameState, initGameState } from './engine';
import { formatToHeader, getUserInput } from './utils';
import { Interpreter } from './interpreter';
import { Narrator } from './narrator';
import { RoomState } from './domain/room';

async function main() {
    const interpreter = new Interpreter();
    const narrator = new Narrator();
    let spinner = ora({ spinner: 'simpleDots' });
    let state = initGameState();

    spinner = spinner.start();
    let text = await narrator.narrate(state, state, [
        {
            action: { type: ActionType.START },
            outcome: { result: 'success' },
        },
    ]);
    spinner.stop();

    console.log(formatToHeader(getCurrentRoom(state).name));
    console.log(text);

    while (true) {
        console.log('');
        const input = await getUserInput('');
        spinner = spinner.start();
        const actions = [await interpreter.parse(input, state)].flat();
        spinner.stop();

        console.log('action:', JSON.stringify(actions, null, 2));

        if (actions.some((action) => action.type === ActionType.QUIT)) {
            break;
        }

        const { state: newState, resolvedActions } = resolveActions(state, actions);

        console.log('resolvedActions:', JSON.stringify(resolvedActions, null, 2));

        spinner = spinner.start();
        text = await narrator.narrate(state, newState, resolvedActions);
        spinner.stop();

        if (
            resolvedActions.some(
                ({ action, outcome }) => action.type === ActionType.MOVE && outcome.result === 'success',
            )
        ) {
            console.log(formatToHeader(getCurrentRoom(newState).name));
        }
        console.log(text);
        state = newState;
    }
}

const resolveActions = (
    state: GameState,
    actions: Action[],
): { state: GameState; resolvedActions: ResolvedAction[] } => {
    let newState = state;
    const resolvedActions: ResolvedAction[] = [];
    for (const action of actions) {
        const { state: nextState, outcome } = applyAction(newState, action);
        newState = nextState;
        resolvedActions.push({ action, outcome });
        if (outcome.result !== 'success') {
            // if unsuccessful, do not process any further actions
            break;
        }
    }
    return {
        state: newState,
        resolvedActions,
    };
};

const getCurrentRoom = ({ world, player }: GameState): RoomState => world.rooms[player.currentRoomId];

main();
