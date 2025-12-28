//region imports
import ora from 'ora';
import { ActionType } from './action';
import { applyAction, initGameState } from './engine';
import { getUserInput } from './utils';
import { ActionInterpreter } from './interpreter';
import { Narrator } from './narrator';

//endregion

async function main() {
    const interpreter = new ActionInterpreter();
    const narrator = new Narrator();
    let spinner = ora({ spinner: 'simpleDots' });
    let state = initGameState();

    spinner = spinner.start();
    let text = await narrator.narrate(state, state, { type: ActionType.START }, { result: 'success' });
    spinner.stop();

    console.log(text);

    while (true) {
        console.log('');
        const input = await getUserInput('');
        spinner = spinner.start();
        const action = await interpreter.parse(input, state);
        spinner.stop();

        console.log(JSON.stringify(action));

        if (action.type === ActionType.QUIT) {
            break;
        }
        const { state: newState, outcome } = applyAction(state, action);

        spinner = spinner.start();
        text = await narrator.narrate(state, newState, action, outcome);
        spinner.stop();

        console.log(text);
        state = newState;
    }
}

main();
