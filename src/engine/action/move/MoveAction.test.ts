import { describe, it } from 'mocha';
import { expect } from 'chai';

import { MoveAction } from './MoveAction';
import { Context, GameContext } from '../../context';
import { GameTransaction } from '../../transaction';
import { createGameState, ModifyState } from '../../state/GameState.test.utils';
import { DefaultRoomFactory, DefaultItemFactory } from '../../entity';
import { ExitState, GameState } from '../../state';

describe(MoveAction.name, () => {
    function createDefaultContext(modifyState?: ModifyState): Context {
        const state = createGameState(modifyState);
        return new GameContext(new GameTransaction(state), {
            room: new DefaultRoomFactory(),
            item: new DefaultItemFactory(),
        });
    }

    function setExitsInCurrentRoom(...exits: ExitState[]): (state: GameState) => void {
        return (state) => (state.rooms[state.player.currentRoomId].exits = exits ?? []);
    }

    describe('execute', () => {
        it('should move the player and return a success outcome with the destination room id', () => {
            const ctx = createDefaultContext(setExitsInCurrentRoom({ direction: 'west', destinationRoomId: 'room_2' }));

            const outcome = MoveAction.execute(ctx, { direction: 'west' });

            expect(outcome).to.deep.equal({ result: 'success', data: { roomId: 'room_2' } });
            expect(ctx.player().currentRoomId).to.equal('room_2');
        });

        it('should return a failure outcome when there is no exit in that direction', () => {
            const ctx = createDefaultContext();

            const outcome = MoveAction.execute(ctx, { direction: 'north' });

            expect(outcome).to.deep.equal({ result: 'failure', reason: 'no_exit', message: undefined });
            expect(ctx.player().currentRoomId).to.equal('room_1');
        });

        it('should return a failure outcome when the exit is blocked', () => {
            const exit: ExitState = {
                direction: 'south',
                destinationRoomId: 'room_2',
                isBlocked: true,
                blockReason: 'door_locked',
            };
            const ctx = createDefaultContext(setExitsInCurrentRoom(exit));

            const outcome = MoveAction.execute(ctx, { direction: 'south' });

            expect(outcome).to.deep.equal({ result: 'failure', reason: 'exit_blocked', message: undefined });
            expect(ctx.player().currentRoomId).to.equal('room_1');
        });
    });

    describe('inputSchema', () => {
        it('should accept a valid direction', () => {
            expect(() => MoveAction.inputSchema.parse({ direction: 'north' })).to.not.throw();
        });

        it('should reject an invalid direction', () => {
            expect(() => MoveAction.inputSchema.parse({ direction: 'sideways' })).to.throw();
        });
    });
});
