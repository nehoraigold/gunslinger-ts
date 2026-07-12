import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { ChoiceTurnStrategy } from './ChoiceTurnStrategy';
import { TurnStrategy } from './TurnStrategy';
import { ActionDispatcher } from './dispatch';
import { ChoiceProvider, OfferedChoice } from './choice';
import { OutcomeNarrator } from './OutcomeNarrator';
import { GameSession } from '../engine/session';
import { Factories } from '../engine/context';
import { createGameState } from '../engine/state/GameState.test.utils';
import { DefaultRoomFactory, DefaultItemFactory, DefaultNpcFactory } from '../engine/entity';

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
        it('should delegate to the inner strategy and attach choices computed from the resulting state', async () => {
            const session = createSession();
            const inner: TurnStrategy = {
                takeTurn: sinon.stub().resolves({ narration: 'You look around.', choices: [] }),
            };
            const actionDispatcher: ActionDispatcher = { dispatch: sinon.stub() };
            const choiceProvider: ChoiceProvider = { compute: sinon.stub().returns([BUY_ITEM]) };
            const narrator: OutcomeNarrator = { narrate: sinon.stub() };
            const strategy = new ChoiceTurnStrategy(inner, actionDispatcher, choiceProvider, narrator);

            const output = await strategy.takeTurn(session, 'look around');

            expect(output).to.deep.equal({ narration: 'You look around.', choices: [BUY_ITEM.choice] });
            expect((inner.takeTurn as sinon.SinonStub).calledWith(session, 'look around')).to.be.true;
            expect((choiceProvider.compute as sinon.SinonStub).calledWith(session.getState())).to.be.true;
        });
    });

    describe('selectChoice', () => {
        it('should be a no-op and leave current choices unchanged when the id is unknown', async () => {
            const session = createSession();
            const inner: TurnStrategy = {
                takeTurn: sinon.stub().resolves({ narration: '', choices: [] }),
            };
            const actionDispatcher: ActionDispatcher = { dispatch: sinon.stub() };
            const choiceProvider: ChoiceProvider = { compute: sinon.stub().returns([BUY_ITEM]) };
            const narrator: OutcomeNarrator = { narrate: sinon.stub() };
            const strategy = new ChoiceTurnStrategy(inner, actionDispatcher, choiceProvider, narrator);
            await strategy.takeTurn(session, 'talk to npc_1');

            const output = await strategy.selectChoice(session, 'nonexistent');

            expect(output).to.deep.equal({ narration: '', choices: [BUY_ITEM.choice] });
            expect((actionDispatcher.dispatch as sinon.SinonStub).called).to.be.false;
            expect((narrator.narrate as sinon.SinonStub).called).to.be.false;
        });

        it('should dispatch the matching invocation, narrate the result, and recompute choices', async () => {
            const session = createSession();
            const inner: TurnStrategy = {
                takeTurn: sinon.stub().resolves({ narration: '', choices: [] }),
            };
            const actionDispatcher: ActionDispatcher = {
                dispatch: sinon.stub().returns({ content: '{"result":"success"}' }),
            };
            const computeStub = sinon.stub<[], OfferedChoice[]>();
            computeStub.onCall(0).returns([BUY_ITEM]);
            computeStub.onCall(1).returns([]);
            const choiceProvider: ChoiceProvider = { compute: computeStub };
            const narrator: OutcomeNarrator = { narrate: sinon.stub().resolves('You buy Item 1 for 18 gold.') };
            const strategy = new ChoiceTurnStrategy(inner, actionDispatcher, choiceProvider, narrator);
            await strategy.takeTurn(session, 'talk to npc_1');

            const output = await strategy.selectChoice(session, 'buy:item_1');

            expect(output).to.deep.equal({ narration: 'You buy Item 1 for 18 gold.', choices: [] });
            expect((actionDispatcher.dispatch as sinon.SinonStub).calledWith(session, BUY_ITEM.invocation)).to.be.true;
            expect(
                (narrator.narrate as sinon.SinonStub).calledWith(session, BUY_ITEM.invocation, {
                    content: '{"result":"success"}',
                }),
            ).to.be.true;
        });
    });
});
