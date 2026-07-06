import { describe, it } from 'mocha';
import { expect } from 'chai';

import { TalkToAction } from './TalkToAction';
import { Context, GameContext } from '../../context';
import { GameTransaction } from '../../transaction';
import { GameSession } from '../../session';
import { createGameState, ModifyState } from '../../state/GameState.test.utils';
import { DefaultRoomFactory, DefaultItemFactory, DefaultNpcFactory } from '../../entity';
import { GameState } from '../../state';
import { NpcNotFoundError } from '../../error';

describe(TalkToAction.name, () => {
    const factories = {
        room: new DefaultRoomFactory(),
        item: new DefaultItemFactory(),
        npc: new DefaultNpcFactory(),
    };

    function createDefaultContext(modifyState?: ModifyState): Context {
        const state = createGameState(modifyState);
        return new GameContext(new GameTransaction(state), factories);
    }

    function withNpcInRoom(npcId: string): (state: GameState) => void {
        return (state) => {
            state.rooms.room_1.npcIds.push(npcId);
        };
    }

    describe('execute', () => {
        it('should return the dialogue line of an npc present in the current room', () => {
            const ctx = createDefaultContext(withNpcInRoom('npc_1'));

            const outcome = new TalkToAction().execute(ctx, { npcId: 'npc_1' });

            expect(outcome).to.deep.equal({
                result: 'success',
                data: {
                    npcId: 'npc_1',
                    name: 'Npc 1',
                    dialogue: 'Well met.',
                },
            });
        });

        it('should fail with npc_not_present when the npc exists but is in another room', () => {
            const ctx = createDefaultContext();

            const outcome = new TalkToAction().execute(ctx, { npcId: 'npc_1' });

            expect(outcome).to.deep.include({ result: 'failure', reason: 'npc_not_present' });
        });

        it('should fail with npc_not_present for an id that is not present', () => {
            const ctx = createDefaultContext();

            const outcome = new TalkToAction().execute(ctx, { npcId: 'nonexistent_npc' });

            expect(outcome).to.deep.include({ result: 'failure', reason: 'npc_not_present' });
        });

        it('should throw a NpcNotFoundError when a present npc has no definition', () => {
            const ctx = createDefaultContext(withNpcInRoom('nonexistent_npc'));

            const talk = () => new TalkToAction().execute(ctx, { npcId: 'nonexistent_npc' });

            expect(talk).to.throw(NpcNotFoundError, /nonexistent_npc/);
        });
    });

    describe('read-only', () => {
        it('should not change committed state and should yield the identical outcome when repeated', () => {
            const session = new GameSession(createGameState(withNpcInRoom('npc_1')), factories);
            const stateBefore = session.getState();

            const first = session.playTurn(new TalkToAction(), { npcId: 'npc_1' });
            const second = session.playTurn(new TalkToAction(), { npcId: 'npc_1' });

            expect(session.getState()).to.deep.equal(stateBefore);
            expect(first).to.deep.equal(second);
        });
    });

    describe('schema', () => {
        it('should reject input missing an npcId', () => {
            expect(() => new TalkToAction().schema.parse({})).to.throw();
        });

        it('should accept an npcId', () => {
            expect(() => new TalkToAction().schema.parse({ npcId: 'npc_1' })).to.not.throw();
        });
    });
});
