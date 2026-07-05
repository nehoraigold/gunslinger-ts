import { describe, it } from 'mocha';
import { expect } from 'chai';

import { createSampleWorldState } from './sampleWorld';
import { Direction } from '../engine/state';

const oppositeDirection: Record<Direction, Direction> = {
    north: 'south',
    south: 'north',
    east: 'west',
    west: 'east',
    up: 'down',
    down: 'up',
};

describe(createSampleWorldState.name, () => {
    it('should place the player in a room that exists in the world', () => {
        const state = createSampleWorldState();

        expect(state.rooms[state.player.currentRoomId]).to.not.equal(undefined);
    });

    it('should contain a 3x3 grid of rooms', () => {
        const state = createSampleWorldState();

        expect(Object.keys(state.rooms)).to.have.lengthOf(9);
    });

    it('should only have exits that point to rooms which exist', () => {
        const state = createSampleWorldState();

        for (const room of Object.values(state.rooms)) {
            for (const exit of room.exits) {
                expect(state.rooms[exit.destinationRoomId], `${exit.direction} exit destination`).to.not.equal(
                    undefined,
                );
            }
        }
    });

    it('should have every exit reciprocated by an opposite exit back from its destination', () => {
        const state = createSampleWorldState();

        for (const [roomId, room] of Object.entries(state.rooms)) {
            for (const exit of room.exits) {
                const destination = state.rooms[exit.destinationRoomId];
                const returnExit = destination.exits.find((candidate) => candidate.destinationRoomId === roomId);

                expect(returnExit, `${exit.destinationRoomId} should have an exit back to ${roomId}`).to.not.equal(
                    undefined,
                );
                expect(returnExit!.direction).to.equal(oppositeDirection[exit.direction]);
            }
        }
    });

    it('should have a locked door between the chapel and the well yard', () => {
        const state = createSampleWorldState();

        const chapelExit = state.rooms.chapel.exits.find((exit) => exit.destinationRoomId === 'wellyard');
        const wellyardExit = state.rooms.wellyard.exits.find((exit) => exit.destinationRoomId === 'chapel');

        expect(chapelExit?.isBlocked).to.equal(true);
        expect(chapelExit?.blockReason).to.equal('door_locked');
        expect(wellyardExit?.isBlocked).to.equal(true);
        expect(wellyardExit?.blockReason).to.equal('door_locked');
    });

    it('should place the iron key in the tower', () => {
        const state = createSampleWorldState();

        expect(state.rooms.tower.inventory.iron_key).to.equal(1);
    });

    it('should only have room inventory items that exist in the item registry', () => {
        const state = createSampleWorldState();

        for (const [roomId, room] of Object.entries(state.rooms)) {
            for (const itemId of Object.keys(room.inventory)) {
                expect(state.items[itemId], `${roomId} holds unknown item "${itemId}"`).to.not.equal(undefined);
            }
        }
    });
});
