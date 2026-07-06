import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { LLMGameMaster } from './LLMGameMaster';
import { LLMLoop } from './loop';
import { TurnLifecycle } from './lifecycle';
import { TurnDraft, TurnResult } from './turn';
import { GameSession } from '../../engine/session';
import { Factories } from '../../engine/context';
import { createGameState } from '../../engine/state/GameState.test.utils';
import { DefaultRoomFactory, DefaultItemFactory, DefaultNpcFactory } from '../../engine/entity';

describe(LLMGameMaster.name, () => {
    const factories: Factories = {
        room: new DefaultRoomFactory(),
        item: new DefaultItemFactory(),
        npc: new DefaultNpcFactory(),
    };

    async function readAll(stream: ReadableStream<string>): Promise<string[]> {
        const chunks: string[] = [];
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        return chunks;
    }

    describe('handleInput', () => {
        it('should begin the turn, run the loop, and end the turn into narration', async () => {
            const session = new GameSession(createGameState(), factories);
            const turn: TurnDraft = {
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
            const turnLifecycle: TurnLifecycle = {
                begin: sinon.stub().returns(turn),
                end: sinon.stub().returns('You head north.'),
            };
            const llmLoop: LLMLoop = { run: sinon.stub().resolves(loopResult) };
            const gameMaster = new LLMGameMaster(session, llmLoop, turnLifecycle);

            const chunks = await readAll(gameMaster.handleInput('go north'));

            expect(chunks).to.deep.equal(['You head north.']);
            expect((turnLifecycle.begin as sinon.SinonStub).calledWith(session.getState(), 'go north')).to.be.true;
            expect((llmLoop.run as sinon.SinonStub).calledWith(session, turn)).to.be.true;
            expect((turnLifecycle.end as sinon.SinonStub).calledWith(loopResult)).to.be.true;
        });

        it('should error the stream when the loop rejects', async () => {
            const session = new GameSession(createGameState(), factories);
            const turn: TurnDraft = {
                toRequestMessages: sinon.stub().returns([]),
                recordUserRound: sinon.stub(),
                recordToolRound: sinon.stub(),
                complete: sinon.stub(),
            };
            const turnLifecycle: TurnLifecycle = {
                begin: sinon.stub().returns(turn),
                end: sinon.stub(),
            };
            const llmLoop: LLMLoop = { run: sinon.stub().rejects(new Error('boom')) };
            const gameMaster = new LLMGameMaster(session, llmLoop, turnLifecycle);

            let error: unknown;
            try {
                await readAll(gameMaster.handleInput('go north'));
            } catch (err) {
                error = err;
            }

            expect(error).to.be.instanceOf(Error);
            expect((turnLifecycle.end as sinon.SinonStub).called).to.be.false;
        });
    });
});
