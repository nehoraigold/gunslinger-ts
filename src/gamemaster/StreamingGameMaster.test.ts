import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { StreamingGameMaster } from './StreamingGameMaster';
import { TurnStrategy } from './TurnStrategy';
import { ChoiceProvider } from './choice';
import { GameSession } from '../engine/session';
import { Factories } from '../engine/context';
import { createGameState } from '../engine/state/GameState.test.utils';
import { DefaultRoomFactory, DefaultItemFactory, DefaultNpcFactory } from '../engine/entity';

describe(StreamingGameMaster.name, () => {
    const factories: Factories = {
        room: new DefaultRoomFactory(),
        item: new DefaultItemFactory(),
        npc: new DefaultNpcFactory(),
    };

    function fakeChoiceProvider(overrides: Partial<ChoiceProvider> = {}): ChoiceProvider {
        return {
            compute: sinon.stub().returns([]),
            ...overrides,
        };
    }

    async function readAll(stream: ReadableStream<string>): Promise<string[]> {
        const chunks: string[] = [];
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        return chunks;
    }

    describe('handleInput', () => {
        it('should stream the strategy narration as a single chunk', async () => {
            const session = new GameSession(createGameState(), factories);
            const turnStrategy: TurnStrategy = { takeTurn: sinon.stub().resolves('You head north.') };
            const choiceTurnStrategy: TurnStrategy = { takeTurn: sinon.stub() };
            const gameMaster = new StreamingGameMaster(session, turnStrategy, choiceTurnStrategy, fakeChoiceProvider());

            const chunks = await readAll(gameMaster.handleInput('go north'));

            expect(chunks).to.deep.equal(['You head north.']);
            expect((turnStrategy.takeTurn as sinon.SinonStub).calledWith(session, 'go north')).to.be.true;
        });

        it('should error the stream when the strategy rejects', async () => {
            const session = new GameSession(createGameState(), factories);
            const turnStrategy: TurnStrategy = { takeTurn: sinon.stub().rejects(new Error('boom')) };
            const choiceTurnStrategy: TurnStrategy = { takeTurn: sinon.stub() };
            const gameMaster = new StreamingGameMaster(session, turnStrategy, choiceTurnStrategy, fakeChoiceProvider());

            let error: unknown;
            try {
                await readAll(gameMaster.handleInput('go north'));
            } catch (err) {
                error = err;
            }

            expect(error).to.be.instanceOf(Error);
        });

        it('should refresh and expose the resulting choices via currentChoices', async () => {
            const session = new GameSession(createGameState(), factories);
            const offered = {
                choice: { id: 'buy:item_1', label: 'Buy Item 1 — 18g' },
                invocation: { name: 'buy', args: {} },
            };
            const turnStrategy: TurnStrategy = { takeTurn: sinon.stub().resolves('You talk to the peddler.') };
            const choiceTurnStrategy: TurnStrategy = { takeTurn: sinon.stub() };
            const choiceProvider = fakeChoiceProvider({ compute: sinon.stub().returns([offered]) });
            const gameMaster = new StreamingGameMaster(session, turnStrategy, choiceTurnStrategy, choiceProvider);

            await readAll(gameMaster.handleInput('talk to peddler'));

            expect(gameMaster.currentChoices()).to.deep.equal([offered.choice]);
            expect((choiceProvider.compute as sinon.SinonStub).calledWith(session.getState())).to.be.true;
        });
    });

    describe('selectChoice', () => {
        it('should stream the narration from the choice turn strategy and refresh currentChoices', async () => {
            const session = new GameSession(createGameState(), factories);
            const turnStrategy: TurnStrategy = { takeTurn: sinon.stub() };
            const choiceTurnStrategy: TurnStrategy = { takeTurn: sinon.stub().resolves('You buy Item 1.') };
            const gameMaster = new StreamingGameMaster(session, turnStrategy, choiceTurnStrategy, fakeChoiceProvider());

            const chunks = await readAll(gameMaster.selectChoice('buy:item_1'));

            expect(chunks).to.deep.equal(['You buy Item 1.']);
            expect((choiceTurnStrategy.takeTurn as sinon.SinonStub).calledWith(session, 'buy:item_1')).to.be.true;
            expect(gameMaster.currentChoices()).to.deep.equal([]);
        });
    });
});
