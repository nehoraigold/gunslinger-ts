import * as fs from 'node:fs';
import ora from 'ora';

import { applyEffects, GameState, initGameState, decide, Event } from './engine';
import { formatToHeader, getUserInput } from './utils';
import { Interpreter } from './interpreter';
import { Narrator } from './narrator';
import { Room } from './domain/room';

async function main() {
    const config = JSON.parse(fs.readFileSync('../config.local.json', 'utf-8'));
    const interpreter = new Interpreter();
    const narrator = new Narrator(config);
    let spinner = ora({ spinner: 'simpleDots' });
    let state = initGameState();

    const startEvents: Event[] = [
        {
            action: { type: 'start' },
            outcome: { result: 'success' },
            effects: [],
        },
    ];
    spinner = spinner.start();
    let text = await narrator.narrate(state, startEvents, '');
    spinner.stop();

    printTurn(text, startEvents, state);

    while (true) {
        console.log('');
        const playerText = await getUserInput('');
        spinner = spinner.start();
        const actions = [await interpreter.parse(playerText, state)].flat();
        spinner.stop();
        if (actions.some((action) => action.type === 'quit')) {
            console.log('Goodbye!');
            return;
        }

        const events: Event[] = [];
        let nextState = state;

        for (const action of actions) {
            const decision = decide(nextState, action);
            nextState = applyEffects(nextState, decision.effects ?? []);
            events.push({ action, ...decision });
            if (decision.outcome.result !== 'success') {
                break;
            }
        }

        console.log('events', JSON.stringify(events, null, 2));
        spinner = spinner.start();
        text = await narrator.narrate(nextState, events, playerText);
        spinner.stop();

        printTurn(text, events, nextState);
        state = nextState;
    }
}

const getCurrentRoom = ({ world, player }: GameState): Room => world.rooms[player.currentRoomId];

const printTurn = (narration: string, events: Event[], state: GameState) => {
    if (
        events.some(
            ({ action, outcome }) =>
                action.type === 'start' || (action.type === 'move' && outcome.result === 'success'),
        )
    ) {
        console.log(formatToHeader(getCurrentRoom(state).name));
    }
    console.log(narration);
};

main();
