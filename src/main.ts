import * as readline from 'node:readline';
import { Ollama } from 'ollama';

import { GameSession } from './engine/session';
import { MoveAction } from './engine/action/move/MoveAction';
import { PickUpAction } from './engine/action/pickUp/PickUpAction';
import { DropAction } from './engine/action/drop/DropAction';
import { EquipAction } from './engine/action/equip/EquipAction';
import { UnequipAction } from './engine/action/unequip/UnequipAction';
import { CheckInventoryAction } from './engine/action/checkInventory/CheckInventoryAction';
import { CheckStatusAction } from './engine/action/checkStatus/CheckStatusAction';
import { UnlockAction } from './engine/action/unlock/UnlockAction';
import { LookAction } from './engine/action/look/LookAction';
import { LookItemAction } from './engine/action/lookItem/LookItemAction';
import { LookNpcAction } from './engine/action/lookNpc/LookNpcAction';
import { TalkToAction } from './engine/action/talkTo/TalkToAction';
import { BuyAction } from './engine/action/buy/BuyAction';
import { SellAction } from './engine/action/sell/SellAction';
import { DefaultRoomFactory, DefaultItemFactory, DefaultNpcFactory } from './engine/entity';
import { DefaultDialogueService, CleanupConversationTurnEffect } from './engine/service/dialogue';
import { createSampleWorldState } from './cli/sampleWorld';
import { SaveController } from './cli/save';
import { MetaCommandHandler } from './cli/command';
import { FileSessionRepository } from './persistence';
import { configureLogging, closeLogging, ConsoleLogSink, parseLogLevel, getLogger } from './utils/logger';
import {
    GameMaster,
    StreamingGameMaster,
    ActionToolCatalog,
    DefaultActionDispatcher,
    DefaultWorldSnapshotBuilder,
    StaticInstructionsProvider,
    UnboundedConversationManager,
    DefaultLLMRequestAssembler,
    OllamaLLMClient,
    DefaultTurnLifecycle,
    SequentialLLMLoop,
    LLMTurnStrategy,
    ChoiceTurnStrategy,
    CompositeChoiceProvider,
    ShopChoiceProvider,
    LLMOutcomeNarrator,
} from './gamemaster';

const SYSTEM_PROMPT = [
    // Identity and the two jobs, always in this order.
    'You are the Dungeon Master, narrator and game master of a text adventure. You have two jobs, always in this',
    'order: first call tools to determine what actually happens, then narrate the result in prose. Engine first,',
    'narrator second. The tools are the source of truth — never decide an outcome yourself.',

    // Golden rule.
    'Always call a tool before narrating any outcome, and never invent what happens. The only exception is a purely',
    'conversational message that changes no game state (e.g. "what can I do?", "how do I play?") — answer those',
    'directly in prose, with no tool call.',

    // Act only on the request — this is what stops invented, unrequested actions.
    'Do only what the player’s latest message asks, and nothing more. If they say "go east", move east and do not',
    'also pick up, drop, or unlock anything they did not mention. When their intent is clear, act on it at once',
    'without asking for confirmation; interpret direction generously — "go north", "head north", and "n" all mean',
    'move north.',

    // The tools.
    'Tools: `move` travels through an exit; `pickUp` and `drop` take or leave an item; `checkInventory` lists what',
    'the player carries; `look` surveys the current room, reporting its description, light level, exits, and the',
    'items present; `lookItem` inspects one specific item in the room or inventory (pass the exact id from the',
    'snapshot), reporting its description, kind, location, and quantity; `lookNpc` examines one person present in',
    'the room (pass the exact id from the snapshot), reporting their name and appearance; `talkTo` speaks to a',
    'person present in the room (pass the exact id), returning the single line they say; `unlock` opens a locked',
    'exit in a given direction (the engine knows which key it needs, and',
    'the player must be carrying it). An exit shown as "(blocked: door_locked)" must be unlocked before you can move',
    'through it.',

    // The snapshot is the only source of truth for entities and ids.
    'A world-state snapshot is appended to each player message. It is the only authority on the current room, its',
    'exits, the items present, the people present, and what the player carries. Reference only rooms, exits, items,',
    'and people that appear in it. Pick up only items listed under "ITEMS HERE", talk to or examine only people',
    'listed under "PEOPLE HERE", and always pass the exact id shown in "(id: ...)". Never invent or guess an id,',
    'item, person, exit, or room — if it is not in the snapshot, it is not here.',

    // Narration style and failure handling.
    'Write in second person, present tense, and keep it concise — a sentence or two for an action, a little more for',
    'a room the player is seeing for the first time. Never expose tool names, ids, raw return values, or failure',
    'reasons: narrate failures in-world (an item that is not there is simply absent; a locked door does not budge).',
    'Use plain prose only — no markdown, lists, or headers.',
].join(' ');

configureLogging({
    level: parseLogLevel(process.env.LOG_LEVEL, 'info'),
    sink: new ConsoleLogSink(),
});

const log = getLogger('cli.main');

const dialogueService = new DefaultDialogueService();

const session = new GameSession(
    createSampleWorldState(),
    {
        room: new DefaultRoomFactory(),
        item: new DefaultItemFactory(),
        npc: new DefaultNpcFactory(),
    },
    [new CleanupConversationTurnEffect(dialogueService)],
);

const saveController = new SaveController(new FileSessionRepository(process.env.SAVE_DIR ?? './saves'), session);

const toolCatalog = new ActionToolCatalog({
    move: {
        action: new MoveAction(),
        description:
            'Call when the player expresses intent to travel in any direction (north, south, east, west, up, down).',
    },
    pickUp: {
        action: new PickUpAction(),
        description: 'Call when the player expresses intent to take or pick up an item present in the room.',
    },
    drop: {
        action: new DropAction(),
        description: 'Call when the player expresses intent to drop or leave behind a carried item.',
    },
    equip: {
        action: new EquipAction(),
        description:
            'Call when the player expresses intent to wield, wear, or put on a carried weapon or piece of armor ' +
            '(e.g. "equip the revolver", "put on the duster"). Pass the exact item id from the snapshot. If the ' +
            'matching slot is already filled, the previously-equipped item returns to the inventory automatically.',
    },
    unequip: {
        action: new UnequipAction(),
        description:
            'Call when the player expresses intent to take off, remove, or stow what they have equipped (e.g. ' +
            '"holster the revolver", "take off my armor"). Pass the slot to clear ("weapon" or "armor"); the item ' +
            'returns to the inventory.',
    },
    checkInventory: {
        action: new CheckInventoryAction(),
        description: 'Call when the player asks what they are carrying (e.g. "check my inventory", "what do I have").',
    },
    checkStatus: {
        action: new CheckStatusAction(),
        description:
            'Call when the player asks about their health, condition, or how badly hurt they are (e.g. "how am ' +
            'I doing", "check my health", "am I hurt"). Returns a coarse health description, never exact numbers.',
    },
    look: {
        action: new LookAction(),
        description:
            'Call when the player looks at, examines, or surveys their surroundings (e.g. "look around", "look", ' +
            '"examine the room"). Returns the room description, its light level, the exits, and the items present.',
    },
    lookItem: {
        action: new LookItemAction(),
        description:
            'Call when the player examines or inspects a specific item they can see in the room or are carrying ' +
            '(e.g. "examine the key", "look at the sword"). Pass the exact item id from the snapshot. Returns the ' +
            "item's description, kind, where it is, and how many are present.",
    },
    unlock: {
        action: new UnlockAction(),
        description:
            'Call when the player tries to unlock or open a locked exit (e.g. "unlock the door", "use the key on ' +
            'the south door"). Pass the direction of the locked exit.',
    },
    lookNpc: {
        action: new LookNpcAction(),
        description:
            'Call when the player examines or looks at a person present in the room (e.g. "look at the hermit", ' +
            '"examine the guard"). Pass the exact npc id from the snapshot. Returns the npc\'s name and appearance.',
    },
    talkTo: {
        action: new TalkToAction(dialogueService),
        description:
            'Call when the player speaks to, greets, or asks something of a person present in the room (e.g. ' +
            '"talk to the hermit", "ask the guard about the key"). Pass the exact npc id from the snapshot. ' +
            "Returns the npc's single line of dialogue.",
    },
    buy: {
        action: new BuyAction(),
        description:
            'Call when the player buys a for-sale item from a merchant present in the room (e.g. "buy the ' +
            'rifle", "purchase two potions"). Pass the merchant npc id and the item id from the snapshot, plus ' +
            'an optional quantity (default 1). Only wares the snapshot lists as for sale can be bought.',
    },
    sell: {
        action: new SellAction(),
        description:
            'Call when the player sells an item from their inventory to a merchant present in the room (e.g. ' +
            '"sell my revolver", "sell three pelts"). Pass the merchant npc id and the item id, plus an optional ' +
            'quantity (default 1). The merchant only buys item types the snapshot says it buys.',
    },
});

const ollama = new Ollama(process.env.OLLAMA_HOST ? { host: process.env.OLLAMA_HOST } : undefined);
const model = process.env.OLLAMA_MODEL ?? 'gpt-oss:20b';
const ollamaClient = new OllamaLLMClient(ollama, model);

const requestAssembler = new DefaultLLMRequestAssembler(
    new StaticInstructionsProvider(SYSTEM_PROMPT),
    toolCatalog.listDefinitions(),
);

const conversationManager = new UnboundedConversationManager();
const turnLifecycle = new DefaultTurnLifecycle(new DefaultWorldSnapshotBuilder(), conversationManager);
const actionDispatcher = new DefaultActionDispatcher(toolCatalog);

const turnStrategy = new LLMTurnStrategy(
    new SequentialLLMLoop(ollamaClient, requestAssembler, actionDispatcher),
    turnLifecycle,
);
const choiceProvider = new CompositeChoiceProvider([new ShopChoiceProvider()]);
const choiceTurnStrategy = new ChoiceTurnStrategy(
    actionDispatcher,
    choiceProvider,
    new LLMOutcomeNarrator(turnLifecycle, requestAssembler, ollamaClient),
);

const gameMaster: GameMaster = new StreamingGameMaster(session, turnStrategy, choiceTurnStrategy, choiceProvider);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: '> ' });

function print(line: string): void {
    process.stdout.write(`${line}\n`);
}

print(`Current room: ${session.getState().player.currentRoomId}`);
print('Commands: "save [name]", "load <name>", "saves", "quit".');
rl.prompt();

// readline can emit several buffered `line` events synchronously in one tick (e.g. piped input,
// or a multi-line paste) — this queue ensures one turn fully finishes before the next starts.
let queue: Promise<void> = Promise.resolve();
// Piped stdin hits EOF (and closes the interface) as soon as all input is read, well before a
// pending turn's LLM round-trip finishes — this flag stops us from prompting on a closed interface.
let closed = false;
let autoSaveWarned = false;

const metaCommands = new MetaCommandHandler(saveController, print, () => conversationManager.clear());

function printChoices(): void {
    const choices = gameMaster.currentChoices();
    if (choices.length === 0) {
        return;
    }
    print('Also available:');
    choices.forEach((choice, i) => print(`  [${i + 1}] ${choice.label}`));
}

function streamFor(input: string): ReadableStream<string> {
    const choices = gameMaster.currentChoices();
    const choiceIndex = Number(input);
    if (Number.isInteger(choiceIndex) && choiceIndex >= 1 && choiceIndex <= choices.length) {
        return gameMaster.selectChoice(choices[choiceIndex - 1].id);
    }
    return gameMaster.handleInput(input);
}

async function autoSave(): Promise<void> {
    try {
        await saveController.save();
        autoSaveWarned = false;
    } catch (error) {
        if (!autoSaveWarned) {
            log.error('auto-save failed', { message: error instanceof Error ? error.message : String(error) });
            autoSaveWarned = true;
        }
    }
}

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
            if (await metaCommands.handle(input)) {
                return;
            }
            const stream = streamFor(input);
            for await (const chunk of stream) {
                process.stdout.write(chunk);
            }
            process.stdout.write('\n');
            printChoices();
            await autoSave();
        } catch (error) {
            log.error('turn failed', { input, message: error instanceof Error ? error.message : String(error) });
            print('Something went wrong.');
        } finally {
            if (!closed) rl.prompt();
        }
    });
});

rl.on('close', () => {
    closed = true;
    void queue.then(async () => {
        await closeLogging();
        print('Goodbye.');
        process.exit(0);
    });
});
