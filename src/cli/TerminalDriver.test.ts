import { PassThrough } from 'node:stream';
import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { TerminalDriver } from './TerminalDriver';
import { GameApp } from '../app';
import { SaveController } from '../app/save';
import { GameMaster } from '../gamemaster';
import { GameSession } from '../engine/session';
import { Factories } from '../engine/context';
import { DefaultRoomFactory, DefaultItemFactory, DefaultNpcFactory } from '../engine/entity';
import { createGameState } from '../engine/state/GameState.test.utils';
import { InMemorySessionRepository } from '../persistence';

describe(TerminalDriver.name, () => {
    const factories: Factories = {
        room: new DefaultRoomFactory(),
        item: new DefaultItemFactory(),
        npc: new DefaultNpcFactory(),
    };

    function streamOf(...chunks: string[]): ReadableStream<string> {
        return new ReadableStream<string>({
            start(controller) {
                chunks.forEach((chunk) => controller.enqueue(chunk));
                controller.close();
            },
        });
    }

    function fakeGameMaster(overrides: Partial<GameMaster> = {}): GameMaster {
        return {
            handleInput: sinon.stub().returns(streamOf('ok')),
            selectChoice: sinon.stub().returns(streamOf('ok')),
            currentChoices: sinon.stub().returns([]),
            ...overrides,
        };
    }

    function buildApp(overrides: Partial<GameApp> = {}): GameApp {
        const session = new GameSession(createGameState(), factories);
        const saveController = new SaveController(new InMemorySessionRepository(), session);
        return {
            saveController,
            gameMaster: fakeGameMaster(),
            currentRoomId: () => session.getState().player.currentRoomId,
            resetConversation: sinon.stub(),
            ...overrides,
        };
    }

    function harness(
        app: GameApp,
        options: { onBeforeExit?: () => Promise<void> } = {},
    ): { input: PassThrough; output: PassThrough; driver: TerminalDriver } {
        const input = new PassThrough();
        const output = new PassThrough();
        const driver = new TerminalDriver(app, { input, output, ...options });
        return { input, output, driver };
    }

    function collect(output: PassThrough): string {
        return (output.read() ?? Buffer.alloc(0)).toString();
    }

    function sendLine(input: PassThrough, line: string): void {
        input.write(`${line}\n`);
    }

    describe('run', () => {
        it('should print the current room and the command hint on start, then resolve on quit', async () => {
            const app = buildApp();
            const { input, output, driver } = harness(app);

            const done = driver.run();
            sendLine(input, 'quit');
            await done;

            const text = collect(output);
            expect(text).to.include('Current room: room_1');
            expect(text).to.include('Commands: "save [name]", "load <name>", "saves", "quit".');
            expect(text).to.include('Goodbye.');
        });

        it('should run onBeforeExit to completion before printing Goodbye and resolving', async () => {
            const app = buildApp();
            const order: string[] = [];
            const onBeforeExit = async (): Promise<void> => {
                await Promise.resolve();
                order.push('onBeforeExit');
            };
            const { input, output, driver } = harness(app, { onBeforeExit });
            output.on('data', (chunk: Buffer) => {
                if (chunk.toString().includes('Goodbye.')) {
                    order.push('goodbye');
                }
            });

            const done = driver.run();
            sendLine(input, 'quit');
            await done;

            expect(order).to.deep.equal(['onBeforeExit', 'goodbye']);
        });

        it('should stream game master narration for a plain input and autosave afterward', async () => {
            const app = buildApp({
                gameMaster: fakeGameMaster({ handleInput: sinon.stub().returns(streamOf('You head north.')) }),
            });
            const saveSpy = sinon.spy(app.saveController, 'save');
            const { input, output, driver } = harness(app);

            const done = driver.run();
            sendLine(input, 'go north');
            sendLine(input, 'quit');
            await done;

            const text = collect(output);
            expect(text).to.include('You head north.');
            expect((app.gameMaster.handleInput as sinon.SinonStub).calledWith('go north')).to.be.true;
            expect(saveSpy.calledOnce).to.be.true;
        });

        it('should route numeric input to selectChoice when a choice is pending', async () => {
            const gameMaster = fakeGameMaster({
                currentChoices: sinon.stub().returns([{ id: 'buy_rifle', label: 'Buy the rifle' }]),
                selectChoice: sinon.stub().returns(streamOf('You buy the rifle.')),
            });
            const app = buildApp({ gameMaster });
            const { input, output, driver } = harness(app);

            const done = driver.run();
            sendLine(input, '1');
            sendLine(input, 'quit');
            await done;

            const text = collect(output);
            expect(text).to.include('You buy the rifle.');
            expect((gameMaster.selectChoice as sinon.SinonStub).calledWith('buy_rifle')).to.be.true;
            expect((gameMaster.handleInput as sinon.SinonStub).called).to.be.false;
        });

        it('should handle a meta command without invoking the game master', async () => {
            const app = buildApp();
            const { input, output, driver } = harness(app);

            const done = driver.run();
            sendLine(input, 'saves');
            sendLine(input, 'quit');
            await done;

            const text = collect(output);
            expect(text).to.include('No saves yet.');
            expect((app.gameMaster.handleInput as sinon.SinonStub).called).to.be.false;
        });
    });
});
