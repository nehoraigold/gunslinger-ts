import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { LLMGameMaster } from './LLMGameMaster';
import { TurnRunner } from './turn';
import { UnboundedConversationManager } from './conversation';
import { GameSession } from '../../engine/session';
import { Factories } from '../../engine/context';
import { createGameState } from '../../engine/state/GameState.test.utils';
import { DefaultRoomFactory, DefaultItemFactory } from '../../engine/entity';

describe(LLMGameMaster.name, () => {
    const factories: Factories = { room: new DefaultRoomFactory(), item: new DefaultItemFactory() };

    describe('handleInput', () => {
        it('should delegate to the turn runner with the session, conversation manager, and raw input', () => {
            const session = new GameSession(createGameState(), factories);
            const conversationManager = new UnboundedConversationManager();
            const narrationStream = new ReadableStream<string>();
            const turnRunner: TurnRunner = { runTurn: sinon.stub().returns(narrationStream) };
            const gameMaster = new LLMGameMaster(session, conversationManager, turnRunner);

            const result = gameMaster.handleInput('go north');

            expect(result).to.equal(narrationStream);
            expect((turnRunner.runTurn as sinon.SinonStub).calledWith(session, conversationManager, 'go north')).to.be
                .true;
        });
    });
});
