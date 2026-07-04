import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { LLMGameMaster } from './LLMGameMaster';
import { LLMLoop } from './loop';
import { NarrationResolver } from './narration';
import { TurnDraft, TurnResult } from './turn';
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
            const prepared: TurnDraft = {
                toRequestMessages: sinon.stub().returns([{ role: 'user', text: 'go north\n\nsnapshot' }]),
                recordUserRound: sinon.stub(),
                recordToolRound: sinon.stub(),
                complete: sinon.stub(),
            };
            const loopResult: TurnResult = {
                text: 'You head north.',
                messages: [
                    { role: 'user', text: 'go north\n\nsnapshot' },
                    { role: 'assistant', text: 'You head north.' },
                ],
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
            const prepared: TurnDraft = {
                toRequestMessages: sinon.stub().returns([]),
                recordUserRound: sinon.stub(),
                recordToolRound: sinon.stub(),
                complete: sinon.stub(),
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
