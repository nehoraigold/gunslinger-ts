import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { CleanupConversationTurnEffect } from './CleanupConversationTurnEffect';
import { DialogueService } from './DialogueService';
import { fakeContext, fakePlayer, fakeRoom } from '../../context/Context.test.utils';

describe(CleanupConversationTurnEffect.name, () => {
    describe('apply', () => {
        it('should delegate to the dialogue service with the current player and room', () => {
            const dialogueService: DialogueService = { converseWith: sinon.stub(), endStaleConversation: sinon.stub() };
            const effect = new CleanupConversationTurnEffect(dialogueService);
            const player = fakePlayer();
            const room = fakeRoom();
            const context = fakeContext({ player: () => player, requireCurrentRoom: () => room });

            effect.apply(context);

            expect((dialogueService.endStaleConversation as sinon.SinonStub).calledWith(player, room)).to.be.true;
        });
    });
});
