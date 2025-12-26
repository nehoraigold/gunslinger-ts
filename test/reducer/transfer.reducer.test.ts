import { it, describe } from 'mocha';
import { expect } from 'chai';

import { applyTransfer } from '../../src/reducer';
import { GameState } from '../../src/engine';
import { ActionType } from '../../src/action';
import { InventoryState } from '../../src/domain/inventory';

const deepFreeze = <T>(obj: T): T => {
    Object.freeze(obj);
    Object.getOwnPropertyNames(obj).forEach((prop) => {
        const value: any = (obj as any)[prop];
        if (value && typeof value === 'object' && !Object.isFrozen(value)) {
            deepFreeze(value);
        }
    });
    return obj;
};

const baseState = (): GameState => ({
    world: {
        rooms: {
            'room-1': {
                id: 'room-1',
                name: 'Room 1',
                description: 'A simple room.',
                inventoryId: 'inv-room-1',
                visited: false,
                npcIds: [],
                exits: {},
            },
        },
        inventories: {
            'inv-player': {
                id: 'inv-player',
                items: {
                    'item-mule': 1,
                    'item-coin': 2,
                },
            },
            'inv-room-1': {
                id: 'inv-room-1',
                items: {
                    'item-coin': 8,
                },
            },
            'inv-kennerly': {
                id: 'inv-kennerly',
                items: {},
            },
        },
        items: {
            'item-coin': {
                id: 'item-coin',
                name: 'coin',
                aliases: ['gold', 'money'],
                description: 'An old coin',
            },
            'item-mule': {
                id: 'item-mule',
                name: 'mule',
                aliases: ['donkey', 'ass', 'horse'],
                description: 'An old mule',
            },
        },
        npcs: {
            'npc-kennerly': {
                id: 'npc-kennerly',
                name: 'Kennerly',
                aliases: ['barman', 'bartender', 'barkeep', 'man'],
                description: 'An old man, wrinkled and leathery, polishing a dirty glass behind the bar',
                inventoryId: 'inv-kennerly',
            },
        },
    },
    player: {
        currentRoomId: 'room-1',
        name: 'Hero',
        description: 'The hero',
        inventoryId: 'inv-player',
    },
});

describe('applyTransfer', () => {
    it('should move items from source to target', () => {
        const state = baseState();

        const next = applyTransfer(state, {
            type: ActionType.TRANSFER,
            data: { item: 'coin', from: 'room', to: 'player', quantity: 2 },
        });

        expect(next.world.inventories['inv-player'].items['item-coin']).to.equal(4);
        expect(next.world.inventories['inv-room-1'].items['item-coin']).to.equal(6);
    });

    it('should remove source entry when transferring entire stack', () => {
        const state = baseState();

        const next = applyTransfer(state, {
            type: ActionType.TRANSFER,
            data: { item: 'coin', from: 'room', to: 'player', quantity: 8 },
        });

        expect(next.world.inventories['inv-room-1'].items['item-coin']).to.be.undefined;
    });

    it('should clamp quantity to available amount', () => {
        const state = baseState();

        const next = applyTransfer(state, {
            type: ActionType.TRANSFER,
            data: { item: 'coin', from: 'room', to: 'player', quantity: 10 },
        });

        expect(next.world.inventories['inv-player'].items['item-coin']).to.equal(2);
        expect(next.world.inventories['inv-room-1'].items['item-coin']).to.equal(8);
    });

    it('should fail safely when source is missing', () => {
        const state = baseState();

        const next = applyTransfer(state, {
            type: ActionType.TRANSFER,
            data: { item: 'coin', from: 'npc:nonexistent', to: 'player' },
        });

        expect(next).to.deep.equal(state);
    });

    it('should fail safely when target is missing', () => {
        const state = baseState();

        const next = applyTransfer(state, {
            type: ActionType.TRANSFER,
            data: { item: 'coin', from: 'player', to: 'npc:nonexistent' },
        });

        expect(next).to.deep.equal(state);
    });

    it('should conserve total item quantity', () => {
        const state = baseState();

        const getTotalQuantity = (itemId: string): ((inventories: Record<string, InventoryState>) => number) => {
            return (inventories: Record<string, InventoryState>): number => {
                return Object.values(inventories).reduce((total, inventoryState) => {
                    return total + (inventoryState.items[itemId] ?? 0);
                }, 0);
            };
        };

        const getTotalCoinQuantity = getTotalQuantity('item-coin');
        const totalBefore = getTotalCoinQuantity(state.world.inventories);

        const next = applyTransfer(state, {
            type: ActionType.TRANSFER,
            data: { item: 'coin', from: 'player', to: 'npc:kennerly', quantity: 2 },
        });

        const totalAfter = getTotalCoinQuantity(next.world.inventories);

        expect(totalAfter).to.equal(totalBefore);
    });

    it('should not mutate the original state', () => {
        const state = deepFreeze(baseState());

        const next = applyTransfer(state, {
            type: ActionType.TRANSFER,
            data: { item: 'coin', from: 'room', to: 'player', quantity: 1 },
        });

        expect(next).not.to.equal(state);
        expect(state).to.deep.equal(state);
    });
});
