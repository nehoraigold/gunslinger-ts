//region imports
import ora from 'ora';
import { ActionType } from './action';
import { RoomState } from './domain/room';
import { applyAction, GameState, initializeGameState } from './engine';
import { getUserInput } from './utils';
import { ActionInterpreter } from './interpreter';
import { Narrator } from './narrator';
import { GameMaster } from './gm';

//endregion

async function main() {
    const interpreter = new ActionInterpreter();
    const narrator = new Narrator();
    let spinner = ora({ spinner: 'simpleDots' });
    let state = initializeGameState();

    spinner = spinner.start();
    let text = await narrator.begin(state);
    console.log(text);
    spinner = spinner.clear().stop();

    while (true) {
        const input = await getUserInput('');
        spinner = spinner.start();
        const action = await interpreter.parse(input, state);

        console.log(JSON.stringify(action));

        if (action.type === ActionType.QUIT) {
            spinner.clear().stop();
            break;
        }
        const newState = applyAction(state, action);
        text = await narrator.narrate(state, newState, action, '');
        spinner = spinner.clear().stop();
        console.log(text);
        state = newState;
    }
}

main();
