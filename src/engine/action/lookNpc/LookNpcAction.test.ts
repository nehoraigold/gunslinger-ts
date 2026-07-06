import { describe, it } from 'mocha';
import { expect } from 'chai';

import { LookNpcAction } from './LookNpcAction';
import { Context, GameContext } from '../../context';
import { GameTransaction } from '../../transaction';
import { createGameState, ModifyState } from '../../state/GameState.test.utils';
import { DefaultRoomFactory, DefaultItemFactory, DefaultNpcFactory } from '../../entity';
import { GameState } from '../../state';
import { NpcNotFoundError } from '../../error';

describe(LookNpcAction.name, () => {
    function createDefaultContext(modifyState?: ModifyState): Context {
        const state = createGameState(modifyState);
        return new GameContext(new GameTransaction(state), {
            room: new DefaultRoomFactory(),
            item: new DefaultItemFactory(),
            npc: new DefaultNpcFactory(),
        });
    }

    function withNpcInRoom(npcId: string): (state: GameState) => void {
        return (state) => {
            state.rooms.room_1.npcIds.push(npcId);
        };
    }

    describe('execute', () => {
        it('should describe an npc present in the current room', () => {
            const ctx = createDefaultContext(withNpcInRoom('npc_1'));

            const outcome = new LookNpcAction().execute(ctx, { npcId: 'npc_1' });

            expect(outcome).to.deep.equal({
                result: 'success',
                data: {
                    npcId: 'npc_1',
                    name: 'Npc 1',
                    appearance: 'The first npc',
                },
            });
        });

        it('should fail with npc_not_present when the npc exists but is in another room', () => {
            const ctx = createDefaultContext();

            const outcome = new LookNpcAction().execute(ctx, { npcId: 'npc_1' });

            expect(outcome).to.deep.include({ result: 'failure', reason: 'npc_not_present' });
        });

        it('should fail with npc_not_present for an id that is not present, even with no definition', () => {
            const ctx = createDefaultContext();

            const outcome = new LookNpcAction().execute(ctx, { npcId: 'nonexistent_npc' });

            expect(outcome).to.deep.include({ result: 'failure', reason: 'npc_not_present' });
        });

        it('should throw a NpcNotFoundError when a present npc has no definition', () => {
            const ctx = createDefaultContext(withNpcInRoom('nonexistent_npc'));

            const look = () => new LookNpcAction().execute(ctx, { npcId: 'nonexistent_npc' });

            expect(look).to.throw(NpcNotFoundError, /nonexistent_npc/);
        });
    });

    describe('schema', () => {
        it('should reject input missing an npcId', () => {
            expect(() => new LookNpcAction().schema.parse({})).to.throw();
        });

        it('should accept an npcId', () => {
            expect(() => new LookNpcAction().schema.parse({ npcId: 'npc_1' })).to.not.throw();
        });
    });
});
