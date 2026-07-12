import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { DefaultChoiceResolver } from './DefaultChoiceResolver';
import { ActionDispatcher } from './dispatch';
import { ChoiceProvider, OfferedChoice } from './choice';
import { OutcomeNarrator } from './OutcomeNarrator';
import { GameSession } from '../engine/session';
import { Factories } from '../engine/context';
import { createGameState } from '../engine/state/GameState.test.utils';
import { DefaultRoomFactory, DefaultItemFactory, DefaultNpcFactory } from '../engine/entity';

describe(DefaultChoiceResolver.name, () => {
    const factories: Factories = {
        room: new DefaultRoomFactory(),
        item: new DefaultItemFactory(),
        npc: new DefaultNpcFactory(),
    };

    const BUY_ITEM: OfferedChoice = {
        choice: { id: 'buy:item_1', label: 'Buy Item 1 — 18g' },
        invocation: { name: 'buy', args: { npcId: 'npc_1', itemId: 'item_1', quantity: 1 } },
    };

    function createSession() {
        return new GameSession(createGameState(), factories);
    }

    describe('refreshChoices', () => {
        it('should compute choices from the current session state', () => {
            const session = createSession();
            const actionDispatcher: ActionDispatcher = { dispatch: sinon.stub() };
            const choiceProvider: ChoiceProvider = { compute: sinon.stub().returns([BUY_ITEM]) };
            const narrator: OutcomeNarrator = { narrate: sinon.stub() };
            const resolver = new DefaultChoiceResolver(actionDispatcher, choiceProvider, narrator);

            const choices = resolver.refreshChoices(session);

            expect(choices).to.deep.equal([BUY_ITEM.choice]);
            expect((choiceProvider.compute as sinon.SinonStub).calledWith(session.getState())).to.be.true;
        });
    });

    describe('selectChoice', () => {
        it('should return empty narration and dispatch nothing when the id is unknown', async () => {
            const session = createSession();
            const actionDispatcher: ActionDispatcher = { dispatch: sinon.stub() };
            const choiceProvider: ChoiceProvider = { compute: sinon.stub().returns([BUY_ITEM]) };
            const narrator: OutcomeNarrator = { narrate: sinon.stub() };
            const resolver = new DefaultChoiceResolver(actionDispatcher, choiceProvider, narrator);
            resolver.refreshChoices(session);

            const narration = await resolver.selectChoice(session, 'nonexistent');

            expect(narration).to.equal('');
            expect((actionDispatcher.dispatch as sinon.SinonStub).called).to.be.false;
            expect((narrator.narrate as sinon.SinonStub).called).to.be.false;
        });

        it('should dispatch the matching invocation and narrate the result', async () => {
            const session = createSession();
            const actionDispatcher: ActionDispatcher = {
                dispatch: sinon.stub().returns({ content: '{"result":"success"}' }),
            };
            const choiceProvider: ChoiceProvider = { compute: sinon.stub().returns([BUY_ITEM]) };
            const narrator: OutcomeNarrator = { narrate: sinon.stub().resolves('You buy Item 1 for 18 gold.') };
            const resolver = new DefaultChoiceResolver(actionDispatcher, choiceProvider, narrator);
            resolver.refreshChoices(session);

            const narration = await resolver.selectChoice(session, 'buy:item_1');

            expect(narration).to.equal('You buy Item 1 for 18 gold.');
            expect((actionDispatcher.dispatch as sinon.SinonStub).calledWith(session, BUY_ITEM.invocation)).to.be.true;
            expect(
                (narrator.narrate as sinon.SinonStub).calledWith(session, BUY_ITEM.invocation, {
                    content: '{"result":"success"}',
                }),
            ).to.be.true;
        });
    });
});
