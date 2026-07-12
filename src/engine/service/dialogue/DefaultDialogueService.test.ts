import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { DefaultDialogueService } from './DefaultDialogueService';
import { fakeNpc, fakePlayer, fakeRoom } from '../../context/Context.test.utils';

describe(DefaultDialogueService.name, () => {
    describe('converseWith', () => {
        it('should start the conversation on the given player', () => {
            const service = new DefaultDialogueService();
            const player = fakePlayer({ converseWith: sinon.stub() });
            const npc = fakeNpc({ id: 'hermit' });

            service.converseWith(player, npc);

            expect((player.converseWith as sinon.SinonStub).calledWith(npc)).to.be.true;
        });
    });

    describe('endStaleConversation', () => {
        it('should do nothing when there is no conversation in progress', () => {
            const service = new DefaultDialogueService();
            const player = fakePlayer({ conversationPartnerId: undefined, endConversation: sinon.stub() });
            const room = fakeRoom();

            service.endStaleConversation(player, room);

            expect((player.endConversation as sinon.SinonStub).called).to.be.false;
        });

        it('should leave the conversation in progress when the partner is still in the room', () => {
            const service = new DefaultDialogueService();
            const player = fakePlayer({ conversationPartnerId: 'hermit', endConversation: sinon.stub() });
            const room = fakeRoom({ npcIds: () => ['hermit'] });

            service.endStaleConversation(player, room);

            expect((player.endConversation as sinon.SinonStub).called).to.be.false;
        });

        it('should end the conversation when the partner has left the room', () => {
            const service = new DefaultDialogueService();
            const player = fakePlayer({ conversationPartnerId: 'hermit', endConversation: sinon.stub() });
            const room = fakeRoom({ npcIds: () => [] });

            service.endStaleConversation(player, room);

            expect((player.endConversation as sinon.SinonStub).called).to.be.true;
        });
    });
});
