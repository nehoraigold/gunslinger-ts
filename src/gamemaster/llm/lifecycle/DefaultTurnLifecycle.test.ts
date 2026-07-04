import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { DefaultTurnLifecycle } from './DefaultTurnLifecycle';
import { WorldSnapshotBuilder } from '../snapshot';
import { ConversationManager, ConversationMessage } from '../conversation';
import { createGameState } from '../../../engine/state/GameState.test.utils';

describe(DefaultTurnLifecycle.name, () => {
    function createConversationManager(priorMessages: ConversationMessage[] = []): ConversationManager {
        return {
            appendTurn: sinon.stub(),
            getMessagesForNextRequest: () => priorMessages,
        };
    }

    describe('begin', () => {
        it('should start the turn from the prior conversation history and record the raw input with the world snapshot appended', () => {
            const priorMessages: ConversationMessage[] = [{ role: 'user', text: 'look around' }];
            const conversationManager = createConversationManager(priorMessages);
            const worldSnapshotBuilder: WorldSnapshotBuilder = { build: sinon.stub().returns('=== WORLD STATE ===') };
            const lifecycle = new DefaultTurnLifecycle(worldSnapshotBuilder, conversationManager);
            const state = createGameState();

            const turn = lifecycle.begin(state, 'go north');

            expect((worldSnapshotBuilder.build as sinon.SinonStub).calledWith(state)).to.be.true;
            expect(turn.toRequestMessages()).to.deep.equal([
                ...priorMessages,
                { role: 'user', text: 'go north\n\n=== WORLD STATE ===' },
            ]);
        });
    });

    describe('end', () => {
        it('should persist the given messages to the conversation and return the narration text', () => {
            const conversationManager = createConversationManager();
            const worldSnapshotBuilder: WorldSnapshotBuilder = { build: sinon.stub() };
            const lifecycle = new DefaultTurnLifecycle(worldSnapshotBuilder, conversationManager);
            const messages: ConversationMessage[] = [
                { role: 'user', text: 'go north\n\nsnapshot' },
                { role: 'assistant', text: 'You head north.' },
            ];

            const narration = lifecycle.end({ text: 'You head north.', messages });

            expect(narration).to.equal('You head north.');
            expect((conversationManager.appendTurn as sinon.SinonStub).calledWith(messages)).to.be.true;
        });
    });
});
