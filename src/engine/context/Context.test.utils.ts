import { Context } from './Context';
import { Equipment, Inventory, Item, Npc, Player, Room, Vitals, Wallet } from '../entity';

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

export function fakeEquipment(overrides: Partial<Equipment> = {}): Equipment {
    return {
        equippedIn: () => undefined,
        equip: () => {},
        unequip: () => {},
        ...overrides,
    };
}

export function fakeWallet(overrides: Partial<Wallet> = {}): Wallet {
    return {
        balance: () => 0,
        canAfford: () => false,
        credit: () => {},
        debit: () => {},
        ...overrides,
    };
}

export function fakeVitals(overrides: Partial<Vitals> = {}): Vitals {
    return {
        current: () => 10,
        max: () => 10,
        isAlive: () => true,
        heal: () => {},
        damage: () => {},
        ...overrides,
    };
}

export function fakeItem(overrides: Partial<Item> = {}): Item {
    return {
        id: 'item_1',
        name: 'Item 1',
        description: '',
        type: 'misc',
        stackable: false,
        value: 0,
        weight: 0,
        takeable: true,
        droppable: true,
        ...overrides,
    };
}

export function fakePlayer(overrides: Partial<Player> = {}): Player {
    return {
        currentRoomId: 'room_1',
        conversationPartnerId: undefined,
        moveTo: () => {},
        converseWith: () => {},
        endConversation: () => {},
        inventory: () => fakeInventory(),
        equipment: () => fakeEquipment(),
        wallet: () => fakeWallet(),
        vitals: () => fakeVitals(),
        ...overrides,
    };
}

export function fakeNpc(overrides: Partial<Npc> = {}): Npc {
    return {
        id: 'npc_1',
        name: 'Npc 1',
        appearance: '',
        dialogue: '',
        mood: 'neutral',
        isAlive: () => true,
        wallet: () => fakeWallet(),
        shop: () => undefined,
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
        entryCondition: () => undefined,
        ...overrides,
    };
}

export function fakeContext(overrides: Partial<Context> = {}): Context {
    const unused = (member: string) => (): never => {
        throw new Error(`Context.${member} should not be used in this test`);
    };
    return {
        turnCounter: unused('turnCounter'),
        flags: unused('flags'),
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
