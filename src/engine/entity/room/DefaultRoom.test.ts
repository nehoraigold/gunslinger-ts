import { describe, it } from 'mocha';
import { expect } from 'chai';

import { DefaultRoom } from './DefaultRoom';
import { RootValueStore } from '../../store';
import { RoomState } from '../../state';
import { Condition } from '../../condition/Condition';

describe(DefaultRoom.name, () => {
    function createDefaultRoom(state?: Partial<RoomState>): DefaultRoom {
        const roomStore = new RootValueStore<RoomState>({
            name: 'room_1',
            description: 'description',
            lightLevel: 'bright',
            visited: false,
            exits: [],
            inventory: {},
            npcIds: [],
            ...state,
        });
        return new DefaultRoom('room_1', roomStore);
    }

    describe('id', () => {
        it('should return the id of the room', () => {
            const room = createDefaultRoom();

            expect(room.id).to.equal('room_1');
        });
    });

    describe('entryCondition', () => {
        it('should return undefined when the room has no entry condition', () => {
            expect(createDefaultRoom().entryCondition()).to.be.undefined;
        });

        it('should return the entry condition the room was built with', () => {
            const entryCondition: Condition = { type: 'flag_value', key: 'gate_open', value: true };

            expect(createDefaultRoom({ entryCondition }).entryCondition()).to.deep.equal(entryCondition);
        });
    });

    describe('getExit', () => {
        it('should return an exit corresponding to that direction', () => {
            const room = createDefaultRoom({ exits: [{ direction: 'north', destinationRoomId: 'room_2' }] });

            const exit = room.getExit('north');

            expect(exit).not.to.be.undefined;
        });

        it('should return undefined if no exit exists in that direction', () => {
            const room = createDefaultRoom();

            const exit = room.getExit('south');

            expect(exit).to.be.undefined;
        });
    });

    describe('descriptive accessors', () => {
        it('should expose the name, description, and light level from room state', () => {
            const room = createDefaultRoom({
                name: 'The Vault',
                description: 'A cold stone chamber',
                lightLevel: 'dim',
            });

            expect(room.name).to.equal('The Vault');
            expect(room.description).to.equal('A cold stone chamber');
            expect(room.lightLevel).to.equal('dim');
        });
    });

    describe('visited', () => {
        it('should reflect the visited flag from room state', () => {
            expect(createDefaultRoom({ visited: false }).visited).to.be.false;
            expect(createDefaultRoom({ visited: true }).visited).to.be.true;
        });
    });

    describe('markVisited', () => {
        it('should set the visited flag on room state', () => {
            const room = createDefaultRoom({ visited: false });

            room.markVisited();

            expect(room.visited).to.be.true;
        });
    });

    describe('exits', () => {
        it('should return an exit for each exit in room state', () => {
            const room = createDefaultRoom({
                exits: [
                    { direction: 'north', destinationRoomId: 'room_2' },
                    { direction: 'south', destinationRoomId: 'room_3' },
                ],
            });

            const directions = room.exits().map((exit) => exit.direction);

            expect(directions).to.deep.equal(['north', 'south']);
        });

        it('should return an empty list when the room has no exits', () => {
            expect(createDefaultRoom().exits()).to.deep.equal([]);
        });
    });

    describe('npcIds', () => {
        it('should return the npc ids present in room state', () => {
            const room = createDefaultRoom({ npcIds: ['hermit', 'guard'] });

            expect(room.npcIds()).to.deep.equal(['hermit', 'guard']);
        });

        it('should return an empty list when the room has no npcs', () => {
            expect(createDefaultRoom().npcIds()).to.deep.equal([]);
        });
    });

    describe('inventory', () => {
        it('should reflect the quantities held in room state', () => {
            const room = createDefaultRoom({ inventory: { iron_key: 1 } });

            expect(room.inventory().quantityOf('iron_key')).to.equal(1);
        });

        it('should persist changes made through the returned inventory back into room state', () => {
            const room = createDefaultRoom();

            room.inventory().add('coins', 5);

            expect(room.inventory().quantityOf('coins')).to.equal(5);
        });
    });
});
