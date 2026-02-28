import { StateManager } from '../engine/state/StateManager';
import { Print, setLogLevel, getLogLevel, getUserInput } from '../utils';
import { CommandRegistry } from './CommandRegistry';
import { SlotInfo } from '../engine/meta/GameStorage';

function formatSavedAt(date: Date): string {
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
}

function printSaveList(slots: SlotInfo[]): void {
    Print.Message('Saves:');
    slots.forEach((s, i) => {
        const idx = String(i + 1).padStart(2);
        const name = s.slotId.padEnd(16);
        const turns = `turn ${s.turnCount}`.padEnd(10);
        Print.Message(`  ${idx}. ${name}${turns}${formatSavedAt(s.savedAt)}`);
    });
}

export function registerBuiltins(registry: CommandRegistry): void {
    registry.register('quit', 'Save and quit', async (_args, ctx) => {
        await ctx.storage.save('1', ctx.stateManager.getState());
        Print.Message('Goodbye!');
        process.exit(0);
    });

    registry.register('save', 'Save game to a slot (default: interactive)', async (args, ctx) => {
        if (args[0]) {
            await ctx.storage.save(args[0], ctx.stateManager.getState());
            Print.Message(`Game saved to "${args[0]}".`);
            return;
        }

        const slots = await ctx.storage.listSavesWithMeta();
        if (slots.length > 0) {
            printSaveList(slots);
        }
        const answer = (await getUserInput('Save slot (number or new name):')).trim();
        const idx = parseInt(answer, 10);
        const slotName = !isNaN(idx) && idx >= 1 && idx <= slots.length ? slots[idx - 1].slotId : answer || '1';
        await ctx.storage.save(slotName, ctx.stateManager.getState());
        Print.Message(`Game saved to "${slotName}".`);
    });

    registry.register('load', 'Load game from a slot (default: interactive)', async (args, ctx) => {
        if (args[0]) {
            const loaded = await ctx.storage.load(args[0]);
            if (loaded) {
                ctx.stateManager = new StateManager(loaded);
                ctx.history = [];
                await ctx.narrate(
                    'The player has resumed their adventure. Briefly describe their current surroundings and situation to help orient them.',
                );
            } else {
                Print.Message(`No save found in slot "${args[0]}".`);
            }
            return;
        }

        const slots = await ctx.storage.listSavesWithMeta();
        if (slots.length === 0) {
            Print.Message('No saves found.');
            return;
        }
        printSaveList(slots);
        const answer = (await getUserInput('Load slot (number or name):')).trim();
        const idx = parseInt(answer, 10);
        const slotName = !isNaN(idx) && idx >= 1 && idx <= slots.length ? slots[idx - 1].slotId : answer;
        const loaded = await ctx.storage.load(slotName);
        if (loaded) {
            ctx.stateManager = new StateManager(loaded);
            ctx.history = [];
            await ctx.narrate(
                'The player has resumed their adventure. Briefly describe their current surroundings and situation to help orient them.',
            );
        } else {
            Print.Message(`No save found in slot "${slotName}".`);
        }
    });

    registry.register('saves', 'List available save slots', async (_args, ctx) => {
        const slots = await ctx.storage.listSavesWithMeta();
        if (slots.length === 0) {
            Print.Message('No saves found.');
        } else {
            printSaveList(slots);
        }
    });

    registry.register('model', 'Show current LLM provider and model', (_args, ctx) => {
        Print.Message(`Provider: ${ctx.providerLabel}`);
    });

    registry.register('debug', 'Toggle debug logging: on | off (no arg = show current level)', (args) => {
        const arg = args[0];
        if (arg === 'on') {
            setLogLevel('debug');
            Print.Message('Debug logging enabled.');
        } else if (arg === 'off') {
            setLogLevel('error');
            Print.Message('Debug logging disabled.');
        } else {
            Print.Message(`Log level: ${getLogLevel()}`);
        }
    });
}
