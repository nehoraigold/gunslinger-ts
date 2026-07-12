import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { ChoiceTurnStrategy } from './ChoiceTurnStrategy';
import { ActionDispatcher } from '../dispatch';
import { ChoiceProvider, OfferedChoice } from './provider/ChoiceProvider';
import { OutcomeNarrator } from '../OutcomeNarrator';
import { GameSession } from '../../engine/session';
import { Factories } from '../../engine/context';
import { createGameState } from '../../engine/state/GameState.test.utils';
import { DefaultRoomFactory, DefaultItemFactory, DefaultNpcFactory } from '../../engine/entity';

describe(ChoiceTurnStrategy.name, () => {
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

    describe('takeTurn', () => {
        it('should return empty narration and dispatch nothing when the id is unknown', async () => {
            const session = createSession();
            const actionDispatcher: ActionDispatcher = { dispatch: sinon.stub() };
            const choiceProvider: ChoiceProvider = { compute: sinon.stub().returns([BUY_ITEM]) };
            const narrator: OutcomeNarrator = { narrate: sinon.stub() };
            const strategy = new ChoiceTurnStrategy(actionDispatcher, choiceProvider, narrator);

            const narration = await strategy.takeTurn(session, 'nonexistent');

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
            const strategy = new ChoiceTurnStrategy(actionDispatcher, choiceProvider, narrator);

            const narration = await strategy.takeTurn(session, 'buy:item_1');

            expect(narration).to.equal('You buy Item 1 for 18 gold.');
            expect((choiceProvider.compute as sinon.SinonStub).calledWith(session.getState())).to.be.true;
            expect((actionDispatcher.dispatch as sinon.SinonStub).calledWith(session, BUY_ITEM.invocation)).to.be.true;
            expect(
                (narrator.narrate as sinon.SinonStub).calledWith(session, BUY_ITEM.invocation, {
                    content: '{"result":"success"}',
                }),
            ).to.be.true;
        });

        it('should recompute choices fresh on every call rather than relying on a cache', async () => {
            const session = createSession();
            const actionDispatcher: ActionDispatcher = { dispatch: sinon.stub().returns({ content: '{}' }) };
            const computeStub = sinon.stub<[], OfferedChoice[]>().returns([BUY_ITEM]);
            const choiceProvider: ChoiceProvider = { compute: computeStub };
            const narrator: OutcomeNarrator = { narrate: sinon.stub().resolves('ok') };
            const strategy = new ChoiceTurnStrategy(actionDispatcher, choiceProvider, narrator);

            await strategy.takeTurn(session, 'buy:item_1');
            await strategy.takeTurn(session, 'buy:item_1');

            expect(computeStub.callCount).to.equal(2);
        });
    });
});
