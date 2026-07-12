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
            const turnStrategy: TurnStrategy & ChoiceResolver = {
                takeTurn: sinon.stub().resolves({ narration: 'You head north.', choices: [] }),
                selectChoice: sinon.stub(),
            };
            const gameMaster = new StreamingGameMaster(session, turnStrategy);

            const chunks = await readAll(gameMaster.handleInput('go north'));

            expect(chunks).to.deep.equal(['You head north.']);
            expect((turnStrategy.takeTurn as sinon.SinonStub).calledWith(session, 'go north')).to.be.true;
        });

        it('should error the stream when the strategy rejects', async () => {
            const session = new GameSession(createGameState(), factories);
            const turnStrategy: TurnStrategy & ChoiceResolver = {
                takeTurn: sinon.stub().rejects(new Error('boom')),
                selectChoice: sinon.stub(),
            };
            const gameMaster = new StreamingGameMaster(session, turnStrategy);

            let error: unknown;
            try {
                await readAll(gameMaster.handleInput('go north'));
            } catch (err) {
                error = err;
            }

            expect(error).to.be.instanceOf(Error);
        });

        it('should make the resulting choices available via currentChoices', async () => {
            const session = new GameSession(createGameState(), factories);
            const choice = { id: 'buy:item_1', label: 'Buy Item 1 — 18g' };
            const turnStrategy: TurnStrategy & ChoiceResolver = {
                takeTurn: sinon.stub().resolves({ narration: 'You talk to the peddler.', choices: [choice] }),
                selectChoice: sinon.stub(),
            };
            const gameMaster = new StreamingGameMaster(session, turnStrategy);

            await readAll(gameMaster.handleInput('talk to peddler'));

            expect(gameMaster.currentChoices()).to.deep.equal([choice]);
        });
    });

    describe('selectChoice', () => {
        it('should stream the narration from the strategy and update currentChoices', async () => {
            const session = new GameSession(createGameState(), factories);
            const turnStrategy: TurnStrategy & ChoiceResolver = {
                takeTurn: sinon.stub(),
                selectChoice: sinon.stub().resolves({ narration: 'You buy Item 1.', choices: [] }),
            };
            const gameMaster = new StreamingGameMaster(session, turnStrategy);

            const chunks = await readAll(gameMaster.selectChoice('buy:item_1'));

            expect(chunks).to.deep.equal(['You buy Item 1.']);
            expect((turnStrategy.selectChoice as sinon.SinonStub).calledWith(session, 'buy:item_1')).to.be.true;
            expect(gameMaster.currentChoices()).to.deep.equal([]);
        });
    });
});
