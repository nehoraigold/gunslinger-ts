import { StateManager } from '../engine/state/StateManager';
import { Print, setLogLevel, getLogLevel } from '../utils';
import { CommandRegistry } from './CommandRegistry';

export function registerBuiltins(registry: CommandRegistry): void {
    registry.register('quit', 'Save and quit', async (_args, ctx) => {
        await ctx.storage.save('1', ctx.stateManager.getState());
        Print.Message('Goodbye!');
        process.exit(0);
    });

    registry.register('save', 'Save game to a slot (default: 1)', async (args, ctx) => {
        const slot = args[0] ?? '1';
        await ctx.storage.save(slot, ctx.stateManager.getState());
        Print.Message(`Game saved to slot "${slot}".`);
    });

    registry.register('load', 'Load game from a slot (default: 1)', async (args, ctx) => {
        const slot = args[0] ?? '1';
        const loaded = await ctx.storage.load(slot);
        if (loaded) {
            ctx.stateManager = new StateManager(loaded);
            ctx.history = [];
            Print.Message(`Game loaded from slot "${slot}". Conversation history cleared.`);
        } else {
            Print.Message(`No save found in slot "${slot}".`);
        }
    });

    registry.register('saves', 'List available save slots', async (_args, ctx) => {
        const slots = await ctx.storage.listSaves();
        Print.Message(slots.length ? `Save slots: ${slots.join(', ')}` : 'No saves found.');
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
