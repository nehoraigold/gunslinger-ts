import { StateManager } from '../engine/state/StateManager';
import { GameStorage } from '../engine/meta/GameStorage';
import { ConversationManager } from '../agent/ConversationManager';
import { Print } from '../utils';

export interface CommandContext {
    /** May be replaced by the /load command. */
    stateManager: StateManager;
    /** May be reset by the /load command. */
    conversationManager: ConversationManager;
    storage: GameStorage;
    providerLabel: string;
    /** Send a prompt through the LLM and print the narration. Handles spinner and room header. */
    narrate: (prompt: string) => Promise<void>;
}

type CommandHandler = (args: string[], ctx: CommandContext) => void | Promise<void>;

interface CommandEntry {
    description: string;
    handler: CommandHandler;
    devOnly: boolean;
}

export class CommandRegistry {
    private readonly commands = new Map<string, CommandEntry>();

    register(name: string, description: string, handler: CommandHandler, devOnly = false): void {
        this.commands.set(name.toLowerCase(), { description, handler, devOnly });
    }

    /**
     * Dispatches a slash command. Returns true if the input was a slash command
     * (whether handled or unknown), false if it should be passed to the LLM.
     */
    async dispatch(input: string, ctx: CommandContext): Promise<boolean> {
        if (!input.startsWith('/')) return false;

        const parts = input.slice(1).trim().split(/\s+/);
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        if (cmd === 'help') {
            const playerCmds = [...this.commands.entries()].filter(([, e]) => !e.devOnly);
            const devCmds = [...this.commands.entries()].filter(([, e]) => e.devOnly);
            const lines = ['Commands:'];
            for (const [name, entry] of playerCmds) {
                lines.push(`  /${name.padEnd(18)} ${entry.description}`);
            }
            lines.push(`  /help               Show this help`);
            if (devCmds.length > 0) {
                lines.push('', 'Dev commands:');
                for (const [name, entry] of devCmds) {
                    lines.push(`  /${name.padEnd(18)} ${entry.description}`);
                }
            }
            Print.Message(lines.join('\n'));
            return true;
        }

        const entry = this.commands.get(cmd);
        if (!entry) {
            Print.Message(`Unknown command "/${cmd}". Type /help for available commands.`);
            return true;
        }

        await entry.handler(args, ctx);
        return true;
    }
}
