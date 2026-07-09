import { describe, it } from 'mocha';
import { expect } from 'chai';

import { UnboundedConversationManager } from './UnboundedConversationManager';

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

    describe('clear', () => {
        it('should discard all previously appended messages', () => {
            const manager = new UnboundedConversationManager();
            manager.appendTurn([{ role: 'user', text: 'go north' }]);
            manager.appendTurn([{ role: 'assistant', text: 'You head north.' }]);

            manager.clear();

            expect(manager.getMessagesForNextRequest()).to.deep.equal([]);
        });

        it('should leave the manager usable for new turns after clearing', () => {
            const manager = new UnboundedConversationManager();
            manager.appendTurn([{ role: 'user', text: 'go north' }]);
            manager.clear();

            manager.appendTurn([{ role: 'user', text: 'look' }]);

            expect(manager.getMessagesForNextRequest()).to.deep.equal([{ role: 'user', text: 'look' }]);
        });
    });
});
