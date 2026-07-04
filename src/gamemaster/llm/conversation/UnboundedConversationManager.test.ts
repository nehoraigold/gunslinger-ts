import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { UnboundedConversationManager } from './UnboundedConversationManager';
import { LLMClient } from '../LLMClient';

describe(UnboundedConversationManager.name, () => {
    describe('getMessagesForNextRequest', () => {
        it('should return an empty array before any turn is appended', () => {
            const manager = new UnboundedConversationManager();

            expect(manager.getMessagesForNextRequest()).to.deep.equal([]);
        });

        it('should return the messages from a single appended turn', () => {
            const manager = new UnboundedConversationManager();

            manager.appendTurn([{ role: 'user', text: 'go north' }]);

            expect(manager.getMessagesForNextRequest()).to.deep.equal([{ role: 'user', text: 'go north' }]);
        });

        it('should return messages from multiple turns in the order they were appended', () => {
            const manager = new UnboundedConversationManager();

            manager.appendTurn([{ role: 'user', text: 'go north' }]);
            manager.appendTurn([{ role: 'assistant', text: 'You head north.' }]);

            expect(manager.getMessagesForNextRequest()).to.deep.equal([
                { role: 'user', text: 'go north' },
                { role: 'assistant', text: 'You head north.' },
            ]);
        });
    });

    describe('shouldCompress', () => {
        it('should always return false', () => {
            const manager = new UnboundedConversationManager();

            manager.appendTurn([{ role: 'user', text: 'go north' }]);

            expect(manager.shouldCompress()).to.equal(false);
        });
    });

    describe('compressAsync', () => {
        it('should not call the LLM client', () => {
            const manager = new UnboundedConversationManager();
            const llmClient: LLMClient = { complete: sinon.stub(), stream: sinon.stub() };

            manager.compressAsync(llmClient);

            expect((llmClient.complete as sinon.SinonStub).called).to.be.false;
            expect((llmClient.stream as sinon.SinonStub).called).to.be.false;
        });
    });
});
