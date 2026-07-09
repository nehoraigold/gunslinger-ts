import { describe, it, beforeEach } from 'mocha';
import { expect } from 'chai';

import { MetaCommandHandler } from './MetaCommandHandler';
import { SaveController } from '../save';
import { RestorableSession } from '../../engine/session';
import { GameState } from '../../engine/state';
import { DeepReadonly } from '../../utils/types';
import {
    InMemorySessionRepository,
    InvalidGameDataError,
    InvalidSlotNameError,
    SessionRepository,
} from '../../persistence';
import { createGameState } from '../../engine/state/GameState.test.utils';

class FakeSession implements RestorableSession {
    constructor(private state: GameState) {}

    getState(): DeepReadonly<GameState> {
        return this.state;
    }

    restoreState(state: GameState): void {
        this.state = state;
    }
}

const stateInRoom = (roomId: string): GameState =>
    createGameState((s) => {
        s.player.currentRoomId = roomId;
    });

describe(MetaCommandHandler.name, () => {
    let output: string[];
    let loadsCleared: number;

    const build = (
        repository: SessionRepository,
        session: RestorableSession = new FakeSession(stateInRoom('room_1')),
    ) => {
        const controller = new SaveController(repository, session);
        const handler = new MetaCommandHandler(
            controller,
            (line) => output.push(line),
            () => (loadsCleared += 1),
        );
        return { controller, handler };
    };

    beforeEach(() => {
        output = [];
        loadsCleared = 0;
    });

    it('should not handle a non-meta command', async () => {
        const { handler } = build(new InMemorySessionRepository());

        expect(await handler.handle('go north')).to.equal(false);
        expect(output).to.deep.equal([]);
    });

    describe('save', () => {
        it('should save to the current slot and report it', async () => {
            const repository = new InMemorySessionRepository();
            const { handler } = build(repository);

            expect(await handler.handle('save')).to.equal(true);
            expect(output).to.deep.equal(['Saved to "autosave".']);
            expect(await repository.load('autosave')).to.not.equal(undefined);
        });

        it('should set and save the named slot', async () => {
            const repository = new InMemorySessionRepository();
            const { controller, handler } = build(repository);

            await handler.handle('save tavern');

            expect(output).to.deep.equal(['Saved to "tavern".']);
            expect(controller.currentSlotName()).to.equal('tavern');
            expect(await repository.load('tavern')).to.not.equal(undefined);
        });

        it('should report an invalid name without changing the current slot', async () => {
            const { controller, handler } = build(new InMemorySessionRepository());

            await handler.handle('save bad name');

            expect(output).to.have.lengthOf(1);
            expect(output[0]).to.match(/invalid save name/i);
            expect(controller.currentSlotName()).to.equal('autosave');
        });
    });

    describe('load', () => {
        it('should restore the save, clear narration, and report the room', async () => {
            const repository = new InMemorySessionRepository();
            await repository.save('checkpoint', stateInRoom('room_2'));
            const session = new FakeSession(stateInRoom('room_1'));
            const { handler } = build(repository, session);

            await handler.handle('load checkpoint');

            expect(loadsCleared).to.equal(1);
            expect(output).to.deep.equal(['Loaded "checkpoint". Current room: room_2']);
            expect(session.getState().player.currentRoomId).to.equal('room_2');
        });

        it('should report an unknown save and not clear narration', async () => {
            const { handler } = build(new InMemorySessionRepository());

            await handler.handle('load nope');

            expect(loadsCleared).to.equal(0);
            expect(output).to.deep.equal(['No save named "nope".']);
        });

        it('should prompt for a name when none is given', async () => {
            const { handler } = build(new InMemorySessionRepository());

            await handler.handle('load');

            expect(output).to.deep.equal(['Load which save? Try "saves" to list them.']);
        });

        it('should report a corrupt save gracefully', async () => {
            const corruptRepository: SessionRepository = {
                load: async () => {
                    throw new InvalidGameDataError("Save 'broken' is not valid JSON");
                },
                save: async () => undefined,
                list: async () => [],
            };
            const { handler } = build(corruptRepository);

            await handler.handle('load broken');

            expect(output).to.have.lengthOf(1);
            expect(output[0]).to.match(/could not load "broken"/i);
        });

        it('should report an invalid name from the repository', async () => {
            const rejectingRepository: SessionRepository = {
                load: async (id) => {
                    throw new InvalidSlotNameError(id);
                },
                save: async () => undefined,
                list: async () => [],
            };
            const { handler } = build(rejectingRepository);

            await handler.handle('load ../escape');

            expect(output).to.have.lengthOf(1);
            expect(output[0]).to.match(/invalid save name/i);
        });
    });

    describe('saves', () => {
        it('should report when there are no saves', async () => {
            const { handler } = build(new InMemorySessionRepository());

            await handler.handle('saves');

            expect(output).to.deep.equal(['No saves yet.']);
        });

        it('should list saved slots and mark the current one', async () => {
            const repository = new InMemorySessionRepository();
            const { handler } = build(repository);
            await handler.handle('save one');
            await handler.handle('save two');
            output.length = 0;

            await handler.handle('saves');

            expect(output).to.have.lengthOf(1);
            expect(output[0]).to.contain('one');
            expect(output[0]).to.contain('two (current)');
        });
    });
});
