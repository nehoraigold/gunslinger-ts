import { describe, it } from 'mocha';
import { expect } from 'chai';
import * as sinon from 'sinon';

import { MovementService } from './MovementService';
import { Player, Room } from '../../entity';
import { Context } from '../../context';
import { Direction, RoomId } from '../../state';

import { MockPlayer } from '../../entity/player/MockPlayer';
import { createMockRoom, MockRoomOptions } from '../../entity/room/MockRoom';
import { MockContext } from '../../context/MockContext';
import { RoomNotFoundError } from './error/RoomNotFoundError';

describe(MovementService.name, () => {
    function createPlayerInRoom(roomId: RoomId): Player {
        return new MockPlayer({ currentRoomId: roomId });
    }

    function createRoomMap(...rooms: MockRoomOptions[]) {
        return rooms.reduce(
            (map, opts) => {
                const room = createMockRoom(opts);
                if (map[room.id]) {
                    throw new Error(`Room with id ${room.id} already exists!`);
                }
                map[room.id] = room;
                return map;
            },
            {} as Record<RoomId, Room>,
        );
    }

    function createContextWith(...rooms: MockRoomOptions[]): Context {
        const player = createPlayerInRoom('room_1');
        return new MockContext({
            player,
            rooms: createRoomMap(...rooms),
        });
    }

    describe('move', () => {
        it('should move player to the destination room indicated by the exit', () => {
            const ctx = createContextWith(
                {
                    id: 'room_1',
                    getExit: sinon.stub().returns({ destinationRoomId: 'room_2' }),
                },
                { id: 'room_2' },
            );
            const movement = new MovementService(ctx);

            movement.move('north');

            expect(ctx.player().currentRoomId).to.equal('room_2');
        });

        it("should throw a RoomNotFoundError if the player's current room is not found", () => {
            const player = createPlayerInRoom('room_1');
            const ctx = new MockContext({ player });
            const movement = new MovementService(ctx);

            const move = () => movement.move('north');

            expect(move).to.throw(RoomNotFoundError);
        });

        it("should throw a RoomNotFoundError if the player's current room is not found", () => {
            const player = createPlayerInRoom('room_1');
            const ctx = new MockContext({ player });
            const movement = new MovementService(ctx);

            const move = () => movement.move('north');

            expect(move).to.throw(RoomNotFoundError);
        });
    });
});
