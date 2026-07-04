import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { SequentialLLMLoop } from './SequentialLLMLoop';
import { MaxRoundsExceededError } from './error/MaxRoundsExceededError';
import { LLMClient, LLMResponse } from '..';
import { LLMRequestBuilder, BuiltRequest } from '../request';
import { ToolCallDispatcher } from '../tool';
import { ConversationMessage } from '../conversation';
import { GameSession } from '../../../engine/session';
import { Factories } from '../../../engine/context';
import { createGameState } from '../../../engine/state/GameState.test.utils';
import { DefaultRoomFactory, DefaultItemFactory } from '../../../engine/entity';

describe(SequentialLLMLoop.name, () => {
    const factories: Factories = { room: new DefaultRoomFactory(), item: new DefaultItemFactory() };

    function createSession(): GameSession {
        return new GameSession(createGameState(), factories);
    }

    function fakeBuiltRequest(newMessages: ConversationMessage[]): BuiltRequest {
        return { request: { systemPrompt: 'sys', messages: [], tools: [] }, newMessages };
    }

    const initialRequest = { systemPrompt: 'sys', messages: [], tools: [] };
    const userMessage: ConversationMessage = { role: 'user', text: 'go north\n\nsnapshot' };

    describe('run', () => {
        it('should return the narration and messages when the first round has no tool calls', async () => {
            const session = createSession();
            const requestBuilder: LLMRequestBuilder = {
                buildFromPlayerInput: sinon.stub(),
                buildFromToolResults: sinon.stub(),
            };
            const llmClient: LLMClient = {
                complete: sinon.stub().resolves({ text: 'You head north.', toolCalls: undefined } as LLMResponse),
                stream: sinon.stub(),
            };
            const toolCallDispatcher: ToolCallDispatcher = { dispatch: sinon.stub() };
            const loop = new SequentialLLMLoop(llmClient, requestBuilder, toolCallDispatcher);

            const result = await loop.run(session, {
                priorMessages: [],
                request: initialRequest,
                messages: [userMessage],
            });

            expect(result).to.deep.equal({
                text: 'You head north.',
                messages: [userMessage, { role: 'assistant', text: 'You head north.' }],
            });
        });

        it('should dispatch tool calls and continue until a round has no tool calls', async () => {
            const session = createSession();
            const toolCallMessages: ConversationMessage[] = [
                {
                    role: 'assistant',
                    text: undefined,
                    toolCalls: [{ id: 'call_1', name: 'move', args: { direction: 'north' } }],
                },
                {
                    role: 'tool_results',
                    results: [{ callId: 'call_1', name: 'move', content: '{"result":"success"}' }],
                },
            ];
            const requestBuilder: LLMRequestBuilder = {
                buildFromPlayerInput: sinon.stub(),
                buildFromToolResults: sinon.stub().returns(fakeBuiltRequest(toolCallMessages)),
            };
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
            const loop = new SequentialLLMLoop(llmClient, requestBuilder, toolCallDispatcher);

            const result = await loop.run(session, {
                priorMessages: [userMessage],
                request: initialRequest,
                messages: [userMessage],
            });

            expect((toolCallDispatcher.dispatch as sinon.SinonStub).calledWith(session, toolCall)).to.be.true;
            // The second round's request must include round 1's user message, not just history from before the turn.
            expect(
                (requestBuilder.buildFromToolResults as sinon.SinonStub).calledWith(
                    [userMessage, userMessage],
                    [toolCall],
                    [toolResult],
                    undefined,
                ),
            ).to.be.true;
            expect(result).to.deep.equal({
                text: 'You head north.',
                messages: [userMessage, ...toolCallMessages, { role: 'assistant', text: 'You head north.' }],
            });
        });

        it('should throw a MaxRoundsExceededError once the maximum number of rounds is exceeded', async () => {
            const session = createSession();
            const requestBuilder: LLMRequestBuilder = {
                buildFromPlayerInput: sinon.stub(),
                buildFromToolResults: sinon.stub().returns(fakeBuiltRequest([])),
            };
            const toolCall = { id: 'call_1', name: 'move', args: { direction: 'north' } };
            const llmClient: LLMClient = {
                complete: sinon.stub().resolves({ text: undefined, toolCalls: [toolCall] } as LLMResponse),
                stream: sinon.stub(),
            };
            const toolCallDispatcher: ToolCallDispatcher = {
                dispatch: sinon.stub().returns({ callId: 'call_1', name: 'move', content: '{}' }),
            };
            const loop = new SequentialLLMLoop(llmClient, requestBuilder, toolCallDispatcher, 2);

            let error: unknown;
            try {
                await loop.run(session, { priorMessages: [], request: initialRequest, messages: [] });
            } catch (err) {
                error = err;
            }

            expect(error).to.be.instanceOf(MaxRoundsExceededError);
        });

        it('should propagate an error when the LLM client rejects', async () => {
            const session = createSession();
            const requestBuilder: LLMRequestBuilder = {
                buildFromPlayerInput: sinon.stub(),
                buildFromToolResults: sinon.stub(),
            };
            const llmClient: LLMClient = {
                complete: sinon.stub().rejects(new Error('network down')),
                stream: sinon.stub(),
            };
            const toolCallDispatcher: ToolCallDispatcher = { dispatch: sinon.stub() };
            const loop = new SequentialLLMLoop(llmClient, requestBuilder, toolCallDispatcher);

            let error: unknown;
            try {
                await loop.run(session, { priorMessages: [], request: initialRequest, messages: [] });
            } catch (err) {
                error = err;
            }

            expect(error).to.be.instanceOf(Error);
        });
    });
});
