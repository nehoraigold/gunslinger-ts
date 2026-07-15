import * as readline from 'node:readline';

import { GameApp } from '../app';
import { getLogger } from '../utils/logger';
import { MetaCommandHandler } from './command';

const log = getLogger('cli.terminal');

export class TerminalDriver {
    private readonly rl: readline.Interface;
    private readonly metaCommands: MetaCommandHandler;
    private queue: Promise<void> = Promise.resolve();
    private closed = false;
    private autoSaveWarned = false;

    private readonly input: NodeJS.ReadableStream;
    private readonly output: NodeJS.WritableStream;
    private readonly onBeforeExit: () => Promise<void>;

    constructor(
        private readonly app: GameApp,
        options: {
            input?: NodeJS.ReadableStream;
            output?: NodeJS.WritableStream;
            onBeforeExit?: () => Promise<void>;
        } = {},
    ) {
        this.input = options.input ?? process.stdin;
        this.output = options.output ?? process.stdout;
        this.onBeforeExit = options.onBeforeExit ?? (() => Promise.resolve());
        this.rl = readline.createInterface({ input: this.input, output: this.output, prompt: '> ' });
        this.metaCommands = new MetaCommandHandler(
            app.saveController,
            (line) => this.print(line),
            () => app.conversationManager.clear(),
        );
    }

    run(): Promise<void> {
        this.print(`Current room: ${this.app.session.getState().player.currentRoomId}`);
        this.print('Commands: "save [name]", "load <name>", "saves", "quit".');
        this.rl.prompt();

        this.rl.on('line', (line) => this.onLine(line));

        return new Promise((resolve) => {
            this.rl.on('close', () => {
                this.closed = true;
                void this.queue.then(async () => {
                    await this.onBeforeExit();
                    this.print('Goodbye.');
                    resolve();
                });
            });
        });
    }

    private print(line: string): void {
        this.output.write(`${line}\n`);
    }

    private onLine(line: string): void {
        const input = line.trim();
        if (input.toLowerCase() === 'quit' || input.toLowerCase() === 'exit') {
            this.queue = this.queue.then(() => {
                this.rl.close();
            });
            return;
        }
        if (!input) {
            if (!this.closed) this.rl.prompt();
            return;
        }

        this.queue = this.queue.then(() => this.runTurn(input));
    }

    private async runTurn(input: string): Promise<void> {
        try {
            if (await this.metaCommands.handle(input)) {
                return;
            }
            const stream = this.streamFor(input);
            for await (const chunk of stream) {
                this.output.write(chunk);
            }
            this.output.write('\n');
            this.printChoices();
            await this.autoSave();
        } catch (error) {
            log.error('turn failed', { input, message: error instanceof Error ? error.message : String(error) });
            this.print('Something went wrong.');
        } finally {
            if (!this.closed) this.rl.prompt();
        }
    }

    private streamFor(input: string): ReadableStream<string> {
        const choices = this.app.gameMaster.currentChoices();
        const choiceIndex = Number(input);
        if (Number.isInteger(choiceIndex) && choiceIndex >= 1 && choiceIndex <= choices.length) {
            return this.app.gameMaster.selectChoice(choices[choiceIndex - 1].id);
        }
        return this.app.gameMaster.handleInput(input);
    }

    private printChoices(): void {
        const choices = this.app.gameMaster.currentChoices();
        if (choices.length === 0) {
            return;
        }
        this.print('Also available:');
        choices.forEach((choice, i) => this.print(`  [${i + 1}] ${choice.label}`));
    }

    private async autoSave(): Promise<void> {
        try {
            await this.app.saveController.save();
            this.autoSaveWarned = false;
        } catch (error) {
            if (!this.autoSaveWarned) {
                log.error('auto-save failed', { message: error instanceof Error ? error.message : String(error) });
                this.autoSaveWarned = true;
            }
        }
    }
}
