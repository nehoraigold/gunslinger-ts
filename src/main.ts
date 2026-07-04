import * as readline from 'node:readline';
import { GameSession } from './engine/session';
import { MoveAction } from './engine/action/move/MoveAction';
import { DefaultRoomFactory, DefaultItemFactory } from './engine/entity';
import { createSampleWorldState } from './cli/sampleWorld';
import { parseDirectionCommand } from './cli/parseDirectionCommand';

const session = new GameSession(createSampleWorldState(), {
    room: new DefaultRoomFactory(),
    item: new DefaultItemFactory(),
});

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: '> ' });

console.log(`Current room: ${session.getState().player.currentRoomId}`);
rl.prompt();

rl.on('line', (line) => {
    const input = line.trim().toLowerCase();
    if (input === 'quit' || input === 'exit') {
        rl.close();
        return;
    }

    const direction = parseDirectionCommand(line);
    if (direction) {
        session.playTurn(new MoveAction(), { direction });
    } else {
        console.log('Unknown command.');
    }

    console.log(`Current room: ${session.getState().player.currentRoomId}`);
    rl.prompt();
});

rl.on('close', () => {
    console.log('Goodbye.');
    process.exit(0);
});
