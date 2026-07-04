import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { LLMGameMaster } from './LLMGameMaster';
import { LLMLoop, LLMLoopResult } from './loop';
import { NarrationResolver, PreparedTurn } from './narration';
import { GameSession } from '../../engine/session';
import { Factories } from '../../engine/context';
import { createGameState } from '../../engine/state/GameState.test.utils';
import { DefaultRoomFactory, DefaultItemFactory } from '../../engine/entity';

describe(LLMGameMaster.name, () => {
    const factories: Factories = { room: new DefaultRoomFactory(), item: new DefaultItemFactory() };

    async function readAll(stream: ReadableStream<string>): Promise<string[]> {
        const chunks: string[] = [];
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        return chunks;
    }

    describe('handleInput', () => {
        it('should prepare the turn, run the loop, and resolve the loop result into narration', async () => {
            const session = new GameSession(createGameState(), factories);
            const prepared: PreparedTurn = {
                priorMessages: [],
                request: { systemPrompt: 'sys', messages: [], tools: [] },
                messages: [{ role: 'user', text: 'go north\n\nsnapshot' }],
            };
            const loopResult: LLMLoopResult = {
                text: 'You head north.',
                messages: [...prepared.messages, { role: 'assistant', text: 'You head north.' }],
            };
            const narrationResolver: NarrationResolver = {
                prepare: sinon.stub().returns(prepared),
                resolve: sinon.stub().returns('You head north.'),
            };
            const llmLoop: LLMLoop = { run: sinon.stub().resolves(loopResult) };
            const gameMaster = new LLMGameMaster(session, llmLoop, narrationResolver);

            const chunks = await readAll(gameMaster.handleInput('go north'));

            expect(chunks).to.deep.equal(['You head north.']);
            expect((narrationResolver.prepare as sinon.SinonStub).calledWith(session.getState(), 'go north')).to.be
                .true;
            expect((llmLoop.run as sinon.SinonStub).calledWith(session, prepared)).to.be.true;
            expect((narrationResolver.resolve as sinon.SinonStub).calledWith(loopResult)).to.be.true;
        });

        it('should error the stream when the loop rejects', async () => {
            const session = new GameSession(createGameState(), factories);
            const prepared: PreparedTurn = {
                priorMessages: [],
                request: { systemPrompt: 'sys', messages: [], tools: [] },
                messages: [],
            };
            const narrationResolver: NarrationResolver = {
                prepare: sinon.stub().returns(prepared),
                resolve: sinon.stub(),
            };
            const llmLoop: LLMLoop = { run: sinon.stub().rejects(new Error('boom')) };
            const gameMaster = new LLMGameMaster(session, llmLoop, narrationResolver);

            let error: unknown;
            try {
                await readAll(gameMaster.handleInput('go north'));
            } catch (err) {
                error = err;
            }

            expect(error).to.be.instanceOf(Error);
            expect((narrationResolver.resolve as sinon.SinonStub).called).to.be.false;
        });
    });
});
