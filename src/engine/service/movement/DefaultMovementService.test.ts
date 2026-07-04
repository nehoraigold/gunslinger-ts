import { describe, it } from 'mocha';
import { expect } from 'chai';

import { DefaultMovementService } from './DefaultMovementService';
import { Context, GameContext } from '../../context';
import { ExitState, GameState, RoomId } from '../../state';
import { GameTransaction } from '../../transaction';
import { createGameState, ModifyState } from '../../state/GameState.test.utils';
import { DefaultRoomFactory, DefaultItemFactory } from '../../entity';
import { RoomNotFoundError } from './error';

describe(DefaultMovementService.name, () => {
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

    function setCurrentRoomId(id: RoomId): (state: GameState) => void {
        return (state) => (state.player.currentRoomId = id);
    }

    describe('move', () => {
        it('should move player to the destination room indicated by the exit', () => {
            const ctx = createDefaultContext(setExitsInCurrentRoom({ direction: 'west', destinationRoomId: 'room_2' }));
            const movement = new DefaultMovementService(ctx);
            expect(ctx.player().currentRoomId).to.equal('room_1');

            const outcome = movement.move('west');

            expect(ctx.player().currentRoomId).to.equal('room_2');
            expect(outcome).to.deep.equal({ type: 'moved', room: ctx.room('room_2') });
        });

        it("should throw a RoomNotFoundError if the player's current room is not found", () => {
            const ctx = createDefaultContext(setCurrentRoomId('nonexistent_room'));
            const movement = new DefaultMovementService(ctx);

            const move = () => movement.move('north');

            expect(move).to.throw(RoomNotFoundError, /nonexistent_room/);
            expect(ctx.player().currentRoomId).to.equal('nonexistent_room');
        });

        it('should throw a RoomNotFoundError if the destination room is not found', () => {
            const ctx = createDefaultContext(
                setExitsInCurrentRoom({ direction: 'north', destinationRoomId: 'nonexistent_room' }),
            );
            const movement = new DefaultMovementService(ctx);

            const move = () => movement.move('north');

            expect(move).to.throw(RoomNotFoundError, /nonexistent_room/);
            expect(ctx.player().currentRoomId).to.equal('room_1');
        });

        it('should not move the player if there is no exit in that direction', () => {
            const ctx = createDefaultContext();
            const movement = new DefaultMovementService(ctx);

            const outcome = movement.move('north');

            expect(ctx.player().currentRoomId).to.equal('room_1');
            expect(outcome).to.deep.equal({ type: 'noSuchExit' });
        });

        it('should not move the player if the exit is blocked', () => {
            const exit: ExitState = {
                direction: 'south',
                destinationRoomId: 'room_2',
                isBlocked: true,
                blockReason: 'door_locked',
            };
            const ctx = createDefaultContext(setExitsInCurrentRoom(exit));
            const movement = new DefaultMovementService(ctx);

            const outcome = movement.move('south');

            expect(ctx.player().currentRoomId).to.equal('room_1');
            expect(outcome).to.deep.equal({ type: 'exitBlocked' });
        });
    });
});
