import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';

import { StreamingGameMaster } from './StreamingGameMaster';
import { TurnStrategy } from './TurnStrategy';
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
            const turnStrategy: TurnStrategy = { takeTurn: sinon.stub().resolves('You head north.') };
            const gameMaster = new StreamingGameMaster(session, turnStrategy);

            const chunks = await readAll(gameMaster.handleInput('go north'));

            expect(chunks).to.deep.equal(['You head north.']);
            expect((turnStrategy.takeTurn as sinon.SinonStub).calledWith(session, 'go north')).to.be.true;
        });

        it('should error the stream when the strategy rejects', async () => {
            const session = new GameSession(createGameState(), factories);
            const turnStrategy: TurnStrategy = { takeTurn: sinon.stub().rejects(new Error('boom')) };
            const gameMaster = new StreamingGameMaster(session, turnStrategy);

            let error: unknown;
            try {
                await readAll(gameMaster.handleInput('go north'));
            } catch (err) {
                error = err;
            }

            expect(error).to.be.instanceOf(Error);
        });
    });
});
