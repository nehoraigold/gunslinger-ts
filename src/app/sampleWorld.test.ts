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

    it('should lock the chapel door to the well yard with the iron key', () => {
        const state = createSampleWorldState();

        const chapelExit = state.rooms.chapel.exits.find((exit) => exit.destinationRoomId === 'wellyard');

        expect(chapelExit?.lock).to.deep.equal({ keyItemId: 'iron_key', isLocked: true, consumesKey: false });
    });

    it('should leave the well yard door open from the inside', () => {
        const state = createSampleWorldState();

        const wellyardExit = state.rooms.wellyard.exits.find((exit) => exit.destinationRoomId === 'chapel');

        expect(wellyardExit, 'the well yard should have an exit back to the chapel').to.not.equal(undefined);
        expect(wellyardExit?.lock, 'the way out of the well yard should not be locked').to.equal(undefined);
    });

    it('should make the well yard reachable only through a locked door', () => {
        const state = createSampleWorldState();

        const exitsToWellyard = Object.values(state.rooms).flatMap((room) =>
            room.exits.filter((exit) => exit.destinationRoomId === 'wellyard'),
        );

        expect(exitsToWellyard, 'there should be a way into the well yard').to.not.be.empty;
        for (const exit of exitsToWellyard) {
            expect(exit.lock?.isLocked, 'every entrance to the well yard must be locked').to.equal(true);
        }
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
