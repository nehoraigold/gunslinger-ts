import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { LLMTurnStrategy } from './LLMTurnStrategy';
import { LLMLoop } from './loop';
import { TurnLifecycle } from './lifecycle';
import { TurnDraft, TurnResult } from './turn';
import { GameSession } from '../../engine/session';
import { Factories } from '../../engine/context';
import { createGameState } from '../../engine/state/GameState.test.utils';
import { DefaultRoomFactory, DefaultItemFactory, DefaultNpcFactory } from '../../engine/entity';

describe(LLMTurnStrategy.name, () => {
    const factories: Factories = {
        room: new DefaultRoomFactory(),
        item: new DefaultItemFactory(),
        npc: new DefaultNpcFactory(),
    };

    function fakeTurn(): TurnDraft {
        return {
            toRequestMessages: sinon.stub().returns([]),
            recordUserRound: sinon.stub(),
            recordToolRound: sinon.stub(),
            complete: sinon.stub(),
        };
    }

    describe('takeTurn', () => {
        it('should begin the turn, run the loop, and end the turn into narration', async () => {
            const session = new GameSession(createGameState(), factories);
            const turn = fakeTurn();
            const loopResult: TurnResult = {
                text: 'You head north.',
                messages: [
                    { role: 'user', text: 'go north\n\nsnapshot' },
                    { role: 'assistant', text: 'You head north.' },
                ],
            };
            const turnLifecycle: TurnLifecycle = {
                begin: sinon.stub().returns(turn),
                end: sinon.stub().returns('You head north.'),
            };
            const llmLoop: LLMLoop = { run: sinon.stub().resolves(loopResult) };
            const strategy = new LLMTurnStrategy(llmLoop, turnLifecycle);

            const output = await strategy.takeTurn(session, 'go north');

            expect(output).to.deep.equal({ narration: 'You head north.', choices: [] });
            expect((turnLifecycle.begin as sinon.SinonStub).calledWith(session.getState(), 'go north')).to.be.true;
            expect((llmLoop.run as sinon.SinonStub).calledWith(session, turn)).to.be.true;
            expect((turnLifecycle.end as sinon.SinonStub).calledWith(loopResult)).to.be.true;
        });

        it('should reject without ending the turn when the loop rejects', async () => {
            const session = new GameSession(createGameState(), factories);
            const turnLifecycle: TurnLifecycle = {
                begin: sinon.stub().returns(fakeTurn()),
                end: sinon.stub(),
            };
            const llmLoop: LLMLoop = { run: sinon.stub().rejects(new Error('boom')) };
            const strategy = new LLMTurnStrategy(llmLoop, turnLifecycle);

            let error: unknown;
            try {
                await strategy.takeTurn(session, 'go north');
            } catch (err) {
                error = err;
            }

            expect(error).to.be.instanceOf(Error);
            expect((turnLifecycle.end as sinon.SinonStub).called).to.be.false;
        });
    });
});
