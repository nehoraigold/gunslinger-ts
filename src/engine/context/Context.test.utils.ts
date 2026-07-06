import { Context } from './Context';
import { Inventory, Player, Room } from '../entity';

export function fakeInventory(overrides: Partial<Inventory> = {}): Inventory {
    return {
        quantityOf: () => 0,
        has: () => false,
        add: () => {},
        remove: () => {},
        list: () => [],
        ...overrides,
    };
}

export function fakePlayer(overrides: Partial<Player> = {}): Player {
    return {
        currentRoomId: 'room_1',
        moveTo: () => {},
        inventory: () => fakeInventory(),
        ...overrides,
    };
}

export function fakeRoom(overrides: Partial<Room> = {}): Room {
    return {
        id: 'room_1',
        name: 'Room 1',
        description: '',
        lightLevel: 'bright',
        visited: false,
        getExit: () => undefined,
        exits: () => [],
        markVisited: () => {},
        inventory: () => fakeInventory(),
        npcIds: () => [],
        ...overrides,
    };
}

export function fakeContext(overrides: Partial<Context> = {}): Context {
    const unused = (member: string) => (): never => {
        throw new Error(`Context.${member} should not be used in this test`);
    };
    return {
        player: unused('player'),
        room: unused('room'),
        requireRoom: unused('requireRoom'),
        item: unused('item'),
        requireItem: unused('requireItem'),
        npc: unused('npc'),
        requireNpc: unused('requireNpc'),
        requireCurrentRoom: unused('requireCurrentRoom'),
        ...overrides,
    };
}
