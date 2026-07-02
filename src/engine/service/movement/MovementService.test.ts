import { describe, it } from 'mocha';
import { expect } from 'chai';
import * as sinon from 'sinon';

import { MovementService } from './MovementService';
import { Context, GameContext } from '../../context';
import { ExitState, GameState, RoomId } from '../../state';
import { GameTransaction } from '../../transaction';
import { createGameState, ModifyState } from '../../state/GameState.test.utils';
import { DefaultRoomFactory, DefaultItemFactory } from '../../entity';
import { RoomNotFoundError } from './error';

describe(MovementService.name, () => {
    function createDefaultContext(modifyState?: ModifyState): Context {
        const state = createGameState(modifyState);
        return new GameContext(new GameTransaction(state), {
            room: new DefaultRoomFactory(),
            item: new DefaultItemFactory(),
        });
    }

    function addExitToCurrentRoom(exit: ExitState): (state: GameState) => void {
        return (state) => state.rooms[state.player.currentRoomId].exits.push(exit);
    }

    function setCurrentRoomId(id: RoomId): (state: GameState) => void {
        return (state) => (state.player.currentRoomId = id);
    }

    describe('move', () => {
        it('should move player to the destination room indicated by the exit', () => {
            const ctx = createDefaultContext(addExitToCurrentRoom({ direction: 'west', destinationRoomId: 'room_2 ' }));
            const movement = new MovementService(ctx);
            expect(ctx.player().currentRoomId).to.equal('room_1');

            movement.move('west');

            expect(ctx.player().currentRoomId).to.equal('room_2');
        });

        it("should throw a RoomNotFoundError if the player's current room is not found", () => {
            const ctx = createDefaultContext(setCurrentRoomId('nonexistent_room'));
            const movement = new MovementService(ctx);

            const move = () => movement.move('north');

            expect(move).to.throw(RoomNotFoundError, /nonexistent_room/);
            expect(ctx.player().currentRoomId).to.equal('nonexistent_room');
        });

        it('should throw a RoomNotFoundError if the destination room is not found', () => {
            const ctx = createDefaultContext(
                addExitToCurrentRoom({ direction: 'north', destinationRoomId: 'nonexistent_room' }),
            );
            const movement = new MovementService(ctx);

            const move = () => movement.move('north');

            expect(move).to.throw(RoomNotFoundError, /nonexistent_room/);
            expect(ctx.player().currentRoomId).to.equal('room_1');
        });

        it('should not move the player if there is no exit in that direction', () => {
            const ctx = createDefaultContext();
            const movement = new MovementService(ctx);

            movement.move('north');

            expect(ctx.player().currentRoomId).to.equal('room_1');
        });

        it('should not move the player if the exit is blocked', () => {
            const exit: ExitState = {
                direction: 'south',
                destinationRoomId: 'room_2',
                isBlocked: true,
                blockReason: 'door_locked',
            };
            const ctx = createDefaultContext(addExitToCurrentRoom(exit));
            const movement = new MovementService(ctx);

            movement.move('south');

            expect(ctx.player().currentRoomId).to.equal('room_1');
        });
    });
});
