import * as readline from 'node:readline';
import { Ollama } from 'ollama';

import { GameSession } from './engine/session';
import { MoveAction } from './engine/action/move/MoveAction';
import { DefaultRoomFactory, DefaultItemFactory } from './engine/entity';
import { createSampleWorldState } from './cli/sampleWorld';
import {
    GameMaster,
    LLMGameMaster,
    ActionToolCatalog,
    DefaultToolCallDispatcher,
    DefaultWorldSnapshotBuilder,
    StaticInstructionsProvider,
    UnboundedConversationManager,
    DefaultLLMRequestAssembler,
    OllamaLLMClient,
    DefaultNarrationResolver,
    SequentialLLMLoop,
} from './gamemaster';

const SYSTEM_PROMPT = [
    'You are the Dungeon Master, narrator and game master of a text adventure.',
    'You have two jobs: call tools to determine what actually happens, and narrate the result in immersive prose.',
    'Always call a tool before narrating any outcome — never invent what happens.',
    'The only tool available right now is `move`, for traveling between rooms. Interpret directional intent',
    'generously ("go north", "head north", and "n" all mean the same thing).',
    'A world state snapshot is appended to the end of each player message — treat it as the authoritative source',
    'of the current room, its description, and its exits. Never invent exits or rooms not present in the snapshot.',
    'Write in second person, present tense. Keep narration concise: one or two sentences per turn.',
].join(' ');

const session = new GameSession(createSampleWorldState(), {
    room: new DefaultRoomFactory(),
    item: new DefaultItemFactory(),
});

const toolCatalog = new ActionToolCatalog({
    move: {
        action: new MoveAction(),
        description:
            'Call when the player expresses intent to travel in any direction (north, south, east, west, up, down).',
    },
});

const ollama = new Ollama(process.env.OLLAMA_HOST ? { host: process.env.OLLAMA_HOST } : undefined);
const model = process.env.OLLAMA_MODEL ?? 'llama3.1:8b';

const requestAssembler = new DefaultLLMRequestAssembler(
    new StaticInstructionsProvider(SYSTEM_PROMPT),
    toolCatalog.listDefinitions(),
);

const gameMaster: GameMaster = new LLMGameMaster(
    session,
    new SequentialLLMLoop(
        new OllamaLLMClient(ollama, model),
        requestAssembler,
        new DefaultToolCallDispatcher(toolCatalog),
    ),
    new DefaultNarrationResolver(new DefaultWorldSnapshotBuilder(), new UnboundedConversationManager()),
);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: '> ' });

console.log(`Current room: ${session.getState().player.currentRoomId}`);
rl.prompt();

// readline can emit several buffered `line` events synchronously in one tick (e.g. piped input,
// or a multi-line paste) — this queue ensures one turn fully finishes before the next starts.
let queue: Promise<void> = Promise.resolve();
// Piped stdin hits EOF (and closes the interface) as soon as all input is read, well before a
// pending turn's LLM round-trip finishes — this flag stops us from prompting on a closed interface.
let closed = false;

rl.on('line', (line) => {
    const input = line.trim();
    if (input.toLowerCase() === 'quit' || input.toLowerCase() === 'exit') {
        queue = queue.then(() => {
            rl.close();
        });
        return;
    }
    if (!input) {
        if (!closed) rl.prompt();
        return;
    }

    queue = queue.then(async () => {
        try {
            const stream = gameMaster.handleInput(input);
            for await (const chunk of stream) {
                process.stdout.write(chunk);
            }
            process.stdout.write('\n');
        } catch (error) {
            console.error('Something went wrong:', error instanceof Error ? error.message : error);
        } finally {
            if (!closed) rl.prompt();
        }
    });
});

rl.on('close', () => {
    closed = true;
    void queue.then(() => {
        console.log('Goodbye.');
        process.exit(0);
    });
});
