import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { StreamingGameMaster } from './StreamingGameMaster';
import { TurnStrategy } from './TurnStrategy';
import { ChoiceResolver } from './ChoiceResolver';
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

    function fakeChoiceResolver(overrides: Partial<ChoiceResolver> = {}): ChoiceResolver {
        return {
            refreshChoices: sinon.stub().returns([]),
            selectChoice: sinon.stub(),
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
            const choiceResolver = fakeChoiceResolver();
            const gameMaster = new StreamingGameMaster(session, turnStrategy, choiceResolver);

            const chunks = await readAll(gameMaster.handleInput('go north'));

            expect(chunks).to.deep.equal(['You head north.']);
            expect((turnStrategy.takeTurn as sinon.SinonStub).calledWith(session, 'go north')).to.be.true;
        });

        it('should error the stream when the strategy rejects', async () => {
            const session = new GameSession(createGameState(), factories);
            const turnStrategy: TurnStrategy = { takeTurn: sinon.stub().rejects(new Error('boom')) };
            const gameMaster = new StreamingGameMaster(session, turnStrategy, fakeChoiceResolver());

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
            const choice = { id: 'buy:item_1', label: 'Buy Item 1 — 18g' };
            const turnStrategy: TurnStrategy = { takeTurn: sinon.stub().resolves('You talk to the peddler.') };
            const choiceResolver = fakeChoiceResolver({ refreshChoices: sinon.stub().returns([choice]) });
            const gameMaster = new StreamingGameMaster(session, turnStrategy, choiceResolver);

            await readAll(gameMaster.handleInput('talk to peddler'));

            expect(gameMaster.currentChoices()).to.deep.equal([choice]);
            expect((choiceResolver.refreshChoices as sinon.SinonStub).calledWith(session)).to.be.true;
        });
    });

    describe('selectChoice', () => {
        it('should stream the narration from the resolver and refresh currentChoices', async () => {
            const session = new GameSession(createGameState(), factories);
            const turnStrategy: TurnStrategy = { takeTurn: sinon.stub() };
            const choiceResolver = fakeChoiceResolver({
                selectChoice: sinon.stub().resolves('You buy Item 1.'),
                refreshChoices: sinon.stub().returns([]),
            });
            const gameMaster = new StreamingGameMaster(session, turnStrategy, choiceResolver);

            const chunks = await readAll(gameMaster.selectChoice('buy:item_1'));

            expect(chunks).to.deep.equal(['You buy Item 1.']);
            expect((choiceResolver.selectChoice as sinon.SinonStub).calledWith(session, 'buy:item_1')).to.be.true;
            expect(gameMaster.currentChoices()).to.deep.equal([]);
        });
    });
});
