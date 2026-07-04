import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { SequentialTurnRunner } from './SequentialTurnRunner';
import { LLMClient, LLMResponse } from '..';
import { LLMRequestBuilder, BuiltRequest } from '../request';
import { ToolCallDispatcher } from '../tool';
import { ConversationManager, ConversationMessage } from '../conversation';
import { GameSession } from '../../../engine/session';
import { Factories } from '../../../engine/context';
import { createGameState } from '../../../engine/state/GameState.test.utils';
import { DefaultRoomFactory, DefaultItemFactory } from '../../../engine/entity';

describe(SequentialTurnRunner.name, () => {
    const factories: Factories = { room: new DefaultRoomFactory(), item: new DefaultItemFactory() };

    function createSession(): GameSession {
        return new GameSession(createGameState(), factories);
    }

    function createConversationManager(): ConversationManager {
        return {
            appendTurn: sinon.stub(),
            getMessagesForNextRequest: () => [],
        };
    }

    function fakeBuiltRequest(newMessages: ConversationMessage[]): BuiltRequest {
        return { request: { systemPrompt: 'sys', messages: [], tools: [] }, newMessages };
    }

    async function readAll(stream: ReadableStream<string>): Promise<string[]> {
        const chunks: string[] = [];
        for await (const chunk of stream as unknown as AsyncIterable<string>) {
            chunks.push(chunk);
        }
        return chunks;
    }

    describe('runTurn', () => {
        it('should return the narration when the first round has no tool calls', async () => {
            const session = createSession();
            const conversationManager = createConversationManager();
            const userMessage: ConversationMessage = { role: 'user', text: 'go north\n\nsnapshot' };
            const requestBuilder: LLMRequestBuilder = {
                buildFromPlayerInput: sinon.stub().returns(fakeBuiltRequest([userMessage])),
                buildFromToolResults: sinon.stub(),
            };
            const llmClient: LLMClient = {
                complete: sinon.stub().resolves({ text: 'You head north.', toolCalls: undefined } as LLMResponse),
                stream: sinon.stub(),
            };
            const toolCallDispatcher: ToolCallDispatcher = { dispatch: sinon.stub() };
            const runner = new SequentialTurnRunner(llmClient, requestBuilder, toolCallDispatcher);

            const chunks = await readAll(runner.runTurn(session, conversationManager, 'go north'));

            expect(chunks).to.deep.equal(['You head north.']);
            expect(
                (requestBuilder.buildFromPlayerInput as sinon.SinonStub).calledWith([], session.getState(), 'go north'),
            ).to.be.true;
            expect(
                (conversationManager.appendTurn as sinon.SinonStub).calledWith([
                    userMessage,
                    { role: 'assistant', text: 'You head north.' },
                ]),
            ).to.be.true;
        });

        it('should dispatch tool calls and continue until a round has no tool calls', async () => {
            const session = createSession();
            const conversationManager = createConversationManager();
            const userMessage: ConversationMessage = { role: 'user', text: 'go north\n\nsnapshot' };
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
                buildFromPlayerInput: sinon.stub().returns(fakeBuiltRequest([userMessage])),
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
            const runner = new SequentialTurnRunner(llmClient, requestBuilder, toolCallDispatcher);

            const chunks = await readAll(runner.runTurn(session, conversationManager, 'go north'));

            expect(chunks).to.deep.equal(['You head north.']);
            expect((toolCallDispatcher.dispatch as sinon.SinonStub).calledWith(session, toolCall)).to.be.true;
            // The second round's request must include round 1's user message, not just history from before the turn.
            expect(
                (requestBuilder.buildFromToolResults as sinon.SinonStub).calledWith(
                    [userMessage],
                    [toolCall],
                    [toolResult],
                    undefined,
                ),
            ).to.be.true;
            expect(
                (conversationManager.appendTurn as sinon.SinonStub).calledWith([
                    userMessage,
                    ...toolCallMessages,
                    { role: 'assistant', text: 'You head north.' },
                ]),
            ).to.be.true;
        });

        it('should error the stream once the maximum number of rounds is exceeded', async () => {
            const session = createSession();
            const conversationManager = createConversationManager();
            const requestBuilder: LLMRequestBuilder = {
                buildFromPlayerInput: sinon.stub().returns(fakeBuiltRequest([])),
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
            const runner = new SequentialTurnRunner(llmClient, requestBuilder, toolCallDispatcher, 2);

            let error: unknown;
            try {
                await readAll(runner.runTurn(session, conversationManager, 'go north'));
            } catch (err) {
                error = err;
            }

            expect(error).to.be.instanceOf(Error);
            expect((conversationManager.appendTurn as sinon.SinonStub).called).to.be.false;
        });

        it('should error the stream when the LLM client rejects', async () => {
            const session = createSession();
            const conversationManager = createConversationManager();
            const requestBuilder: LLMRequestBuilder = {
                buildFromPlayerInput: sinon.stub().returns(fakeBuiltRequest([])),
                buildFromToolResults: sinon.stub(),
            };
            const llmClient: LLMClient = {
                complete: sinon.stub().rejects(new Error('network down')),
                stream: sinon.stub(),
            };
            const toolCallDispatcher: ToolCallDispatcher = { dispatch: sinon.stub() };
            const runner = new SequentialTurnRunner(llmClient, requestBuilder, toolCallDispatcher);

            let error: unknown;
            try {
                await readAll(runner.runTurn(session, conversationManager, 'go north'));
            } catch (err) {
                error = err;
            }

            expect(error).to.be.instanceOf(Error);
        });
    });
});
