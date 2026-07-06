import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { SequentialLLMLoop } from './SequentialLLMLoop';
import { MaxRoundsExceededError } from './error/MaxRoundsExceededError';
import { LLMClient, LLMResponse } from '..';
import { LLMRequestAssembler } from '../request';
import { ToolCallDispatcher } from '../tool';
import { TurnDraft, TurnResult } from '../turn';
import { GameSession } from '../../../engine/session';
import { Factories } from '../../../engine/context';
import { createGameState } from '../../../engine/state/GameState.test.utils';
import { DefaultRoomFactory, DefaultItemFactory, DefaultNpcFactory } from '../../../engine/entity';

describe(SequentialLLMLoop.name, () => {
    const factories: Factories = {
        room: new DefaultRoomFactory(),
        item: new DefaultItemFactory(),
        npc: new DefaultNpcFactory(),
    };

    function createSession(): GameSession {
        return new GameSession(createGameState(), factories);
    }

    const assembledRequest = { systemPrompt: 'sys', messages: [], tools: [] };

    function createRequestAssembler(): LLMRequestAssembler {
        return { assemble: sinon.stub().returns(assembledRequest) };
    }

    function fakeTurn(overrides: Partial<TurnDraft> = {}): TurnDraft {
        return {
            toRequestMessages: sinon.stub().returns([]),
            recordUserRound: sinon.stub(),
            recordToolRound: sinon.stub(),
            complete: sinon.stub(),
            ...overrides,
        };
    }

    describe('run', () => {
        it('should return the loop result when the first round has no tool calls', async () => {
            const session = createSession();
            const turnResult: TurnResult = { text: 'You head north.', messages: [] };
            const turn = fakeTurn({ complete: sinon.stub().returns(turnResult) });
            const requestAssembler = createRequestAssembler();
            const llmClient: LLMClient = {
                complete: sinon.stub().resolves({ text: 'You head north.', toolCalls: undefined } as LLMResponse),
                stream: sinon.stub(),
            };
            const toolCallDispatcher: ToolCallDispatcher = { dispatch: sinon.stub() };
            const loop = new SequentialLLMLoop(llmClient, requestAssembler, toolCallDispatcher);

            const result = await loop.run(session, turn);

            expect((requestAssembler.assemble as sinon.SinonStub).calledWith(turn)).to.be.true;
            expect((turn.complete as sinon.SinonStub).calledWith('You head north.')).to.be.true;
            expect(result).to.equal(turnResult);
        });

        it('should dispatch tool calls, record the round, and continue until a round has no tool calls', async () => {
            const session = createSession();
            const turnResult: TurnResult = { text: 'You head north.', messages: [] };
            const turn = fakeTurn({ complete: sinon.stub().returns(turnResult) });
            const requestAssembler = createRequestAssembler();
            const toolCall = { id: 'call_1', name: 'move', args: { direction: 'north' } };
            const toolResult = { callId: 'call_1', name: 'move', content: '{"result":"success"}' };
            const llmClient: LLMClient = {
                complete: sinon
                    .stub()
                    .onCall(0)
                    .resolves({ text: undefined, toolCalls: [toolCall] } as LLMResponse)
                    .onCall(1)
                    .resolves({ text: 'You head north.', toolCalls: undefined } as LLMResponse),
                stream: sinon.stub(),
            };
            const toolCallDispatcher: ToolCallDispatcher = { dispatch: sinon.stub().returns(toolResult) };
            const loop = new SequentialLLMLoop(llmClient, requestAssembler, toolCallDispatcher);

            const result = await loop.run(session, turn);

            expect((toolCallDispatcher.dispatch as sinon.SinonStub).calledWith(session, toolCall)).to.be.true;
            expect((turn.recordToolRound as sinon.SinonStub).calledWith([toolCall], [toolResult], undefined)).to.be
                .true;
            // The request must be re-assembled from the same turn after the tool round is recorded onto it.
            expect((requestAssembler.assemble as sinon.SinonStub).calledTwice).to.be.true;
            expect((requestAssembler.assemble as sinon.SinonStub).secondCall.calledWith(turn)).to.be.true;
            expect(result).to.equal(turnResult);
        });

        it('should throw a MaxRoundsExceededError once the maximum number of rounds is exceeded', async () => {
            const session = createSession();
            const turn = fakeTurn();
            const requestAssembler = createRequestAssembler();
            const toolCall = { id: 'call_1', name: 'move', args: { direction: 'north' } };
            const llmClient: LLMClient = {
                complete: sinon.stub().resolves({ text: undefined, toolCalls: [toolCall] } as LLMResponse),
                stream: sinon.stub(),
            };
            const toolCallDispatcher: ToolCallDispatcher = {
                dispatch: sinon.stub().returns({ callId: 'call_1', name: 'move', content: '{}' }),
            };
            const loop = new SequentialLLMLoop(llmClient, requestAssembler, toolCallDispatcher, 2);

            let error: unknown;
            try {
                await loop.run(session, turn);
            } catch (err) {
                error = err;
            }

            expect(error).to.be.instanceOf(MaxRoundsExceededError);
        });

        it('should propagate an error when the LLM client rejects', async () => {
            const session = createSession();
            const turn = fakeTurn();
            const requestAssembler = createRequestAssembler();
            const llmClient: LLMClient = {
                complete: sinon.stub().rejects(new Error('network down')),
                stream: sinon.stub(),
            };
            const toolCallDispatcher: ToolCallDispatcher = { dispatch: sinon.stub() };
            const loop = new SequentialLLMLoop(llmClient, requestAssembler, toolCallDispatcher);

            let error: unknown;
            try {
                await loop.run(session, turn);
            } catch (err) {
                error = err;
            }

            expect(error).to.be.instanceOf(Error);
        });
    });
});
