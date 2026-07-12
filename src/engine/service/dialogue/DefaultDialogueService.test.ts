import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { DefaultDialogueService } from './DefaultDialogueService';
import { fakeContext, fakePlayer, fakeRoom } from '../../context/Context.test.utils';

describe(DefaultDialogueService.name, () => {
    describe('startConversation', () => {
        it('should start the conversation on the given player', () => {
            const service = new DefaultDialogueService();
            const player = fakePlayer({ startConversation: sinon.stub() });

            service.startConversation(player, 'hermit');

            expect((player.startConversation as sinon.SinonStub).calledWith('hermit')).to.be.true;
        });
    });

    describe('apply', () => {
        it('should do nothing when there is no conversation in progress', () => {
            const service = new DefaultDialogueService();
            const player = fakePlayer({ conversationPartnerId: undefined, endConversation: sinon.stub() });
            const context = fakeContext({ player: () => player });

            service.apply(context);

            expect((player.endConversation as sinon.SinonStub).called).to.be.false;
        });

        it('should leave the conversation in progress when the partner is still in the current room', () => {
            const service = new DefaultDialogueService();
            const player = fakePlayer({ conversationPartnerId: 'hermit', endConversation: sinon.stub() });
            const room = fakeRoom({ npcIds: () => ['hermit'] });
            const context = fakeContext({ player: () => player, requireCurrentRoom: () => room });

            service.apply(context);

            expect((player.endConversation as sinon.SinonStub).called).to.be.false;
        });

        it('should end the conversation when the partner has left the current room', () => {
            const service = new DefaultDialogueService();
            const player = fakePlayer({ conversationPartnerId: 'hermit', endConversation: sinon.stub() });
            const room = fakeRoom({ npcIds: () => [] });
            const context = fakeContext({ player: () => player, requireCurrentRoom: () => room });

            service.apply(context);

            expect((player.endConversation as sinon.SinonStub).called).to.be.true;
        });
    });
});
