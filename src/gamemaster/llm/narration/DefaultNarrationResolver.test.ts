import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { DefaultNarrationResolver } from './DefaultNarrationResolver';
import { LLMRequestBuilder, BuiltRequest } from '../request';
import { ConversationManager, ConversationMessage } from '../conversation';
import { createGameState } from '../../../engine/state/GameState.test.utils';

describe(DefaultNarrationResolver.name, () => {
    function fakeBuiltRequest(newMessages: ConversationMessage[]): BuiltRequest {
        return { request: { systemPrompt: 'sys', messages: [], tools: [] }, newMessages };
    }

    function createConversationManager(priorMessages: ConversationMessage[] = []): ConversationManager {
        return {
            appendTurn: sinon.stub(),
            getMessagesForNextRequest: () => priorMessages,
        };
    }

    describe('prepare', () => {
        it('should build the initial request from the prior conversation history and raw input', () => {
            const priorMessages: ConversationMessage[] = [{ role: 'user', text: 'look around' }];
            const conversationManager = createConversationManager(priorMessages);
            const userMessage: ConversationMessage = { role: 'user', text: 'go north\n\nsnapshot' };
            const requestBuilder: LLMRequestBuilder = {
                buildFromPlayerInput: sinon.stub().returns(fakeBuiltRequest([userMessage])),
                buildFromToolResults: sinon.stub(),
            };
            const resolver = new DefaultNarrationResolver(requestBuilder, conversationManager);
            const state = createGameState();

            const prepared = resolver.prepare(state, 'go north');

            expect(
                (requestBuilder.buildFromPlayerInput as sinon.SinonStub).calledWith(priorMessages, state, 'go north'),
            ).to.be.true;
            expect(prepared).to.deep.equal({
                priorMessages,
                request: { systemPrompt: 'sys', messages: [], tools: [] },
                messages: [userMessage],
            });
        });
    });

    describe('resolve', () => {
        it('should persist the given messages to the conversation and return the narration text', () => {
            const conversationManager = createConversationManager();
            const requestBuilder: LLMRequestBuilder = {
                buildFromPlayerInput: sinon.stub(),
                buildFromToolResults: sinon.stub(),
            };
            const resolver = new DefaultNarrationResolver(requestBuilder, conversationManager);
            const messages: ConversationMessage[] = [
                { role: 'user', text: 'go north\n\nsnapshot' },
                { role: 'assistant', text: 'You head north.' },
            ];

            const narration = resolver.resolve({ text: 'You head north.', messages });

            expect(narration).to.equal('You head north.');
            expect((conversationManager.appendTurn as sinon.SinonStub).calledWith(messages)).to.be.true;
        });
    });
});
