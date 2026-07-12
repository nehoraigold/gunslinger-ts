import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { LLMOutcomeNarrator } from './LLMOutcomeNarrator';
import { TurnLifecycle } from './lifecycle';
import { LLMRequestAssembler } from './request';
import { LLMClient } from './LLMClient';
import { TurnDraft, TurnResult } from './turn';
import { LLMRequest } from './LLMRequest';
import { GameSession } from '../../engine/session';
import { Factories } from '../../engine/context';
import { createGameState } from '../../engine/state/GameState.test.utils';
import { DefaultRoomFactory, DefaultItemFactory, DefaultNpcFactory } from '../../engine/entity';

describe(LLMOutcomeNarrator.name, () => {
    const factories: Factories = {
        room: new DefaultRoomFactory(),
        item: new DefaultItemFactory(),
        npc: new DefaultNpcFactory(),
    };

    function fakeTurn(): TurnDraft {
        return {
            toRequestMessages: sinon.stub().returns([]),
            recordUserRound: sinon.stub(),
            recordToolRound: sinon.stub(),
            complete: sinon.stub(),
        };
    }

    describe('narrate', () => {
        it('should begin a turn, record the outcome as a tool round, and assemble a request with no tools', async () => {
            const session = new GameSession(createGameState(), factories);
            const turn = fakeTurn();
            const request: LLMRequest = { systemPrompt: '', messages: [], tools: [] };
            const turnLifecycle: TurnLifecycle = {
                begin: sinon.stub().returns(turn),
                end: sinon.stub().returns('You buy the revolver for 18 gold.'),
            };
            const requestAssembler: LLMRequestAssembler = { assemble: sinon.stub().returns(request) };
            const llmClient: LLMClient = {
                complete: sinon.stub().resolves({ text: 'You buy the revolver for 18 gold.' }),
                stream: sinon.stub(),
            };
            const narrator = new LLMOutcomeNarrator(turnLifecycle, requestAssembler, llmClient);
            const invocation = { name: 'buy', args: { npcId: 'peddler', itemId: 'rusty_revolver', quantity: 1 } };

            const narration = await narrator.narrate(session, invocation, { content: '{"result":"success"}' });

            expect(narration).to.equal('You buy the revolver for 18 gold.');
            expect((turnLifecycle.begin as sinon.SinonStub).calledWith(session.getState())).to.be.true;
            const [toolCalls, toolResults] = (turn.recordToolRound as sinon.SinonStub).firstCall.args;
            expect(toolCalls).to.deep.equal([{ id: 'choice', name: 'buy', args: invocation.args }]);
            expect(toolResults).to.deep.equal([{ callId: 'choice', name: 'buy', content: '{"result":"success"}' }]);
            expect((requestAssembler.assemble as sinon.SinonStub).calledWith(turn, { includeTools: false })).to.be.true;
            expect((llmClient.complete as sinon.SinonStub).calledWith(request)).to.be.true;
        });

        it('should complete and end the turn with the response text', async () => {
            const session = new GameSession(createGameState(), factories);
            const turn = fakeTurn();
            const turnResult: TurnResult = { text: 'You sell the pelt.', messages: [] };
            (turn.complete as sinon.SinonStub).returns(turnResult);
            const turnLifecycle: TurnLifecycle = {
                begin: sinon.stub().returns(turn),
                end: sinon.stub().returns('You sell the pelt.'),
            };
            const requestAssembler: LLMRequestAssembler = {
                assemble: sinon.stub().returns({ systemPrompt: '', messages: [], tools: [] }),
            };
            const llmClient: LLMClient = {
                complete: sinon.stub().resolves({ text: 'You sell the pelt.' }),
                stream: sinon.stub(),
            };
            const narrator = new LLMOutcomeNarrator(turnLifecycle, requestAssembler, llmClient);
            const invocation = { name: 'sell', args: { npcId: 'peddler', itemId: 'pelt', quantity: 1 } };

            const narration = await narrator.narrate(session, invocation, { content: '{"result":"success"}' });

            expect(narration).to.equal('You sell the pelt.');
            expect((turn.complete as sinon.SinonStub).calledWith('You sell the pelt.')).to.be.true;
            expect((turnLifecycle.end as sinon.SinonStub).calledWith(turnResult)).to.be.true;
        });
    });
});
