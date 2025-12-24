import { it, describe } from 'mocha';
import { expect } from 'chai';

import { applyTransfer } from '../../src/reducer';
import { GameState } from '../../src/engine';
import { ActionType } from '../../src/action';

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
    player: {
        name: 'Hero',
        currentRoomId: 'room',
        inventoryId: 'playerInv',
        description: 'The hero of the game',
    },
    world: {
        rooms: {},
        inventories: {
            roomInv: {
                id: 'roomInv',
                items: { coin: 3 },
            },
            playerInv: {
                id: 'playerInv',
                items: {},
            },
        },
        items: {
            coin: {
                id: 'coin',
                name: 'coin',
                aliases: ['gold', 'money'],
                description: 'Old golden coin',
            },
        },
        npcs: {},
    },
});

describe('applyTransfer', () => {
    it('moves items from source to target', () => {
        const state = baseState();

        const next = applyTransfer(state, {
            type: ActionType.TRANSFER,
            data: { itemId: 'coin', fromInventoryId: 'roomInv', toInventoryId: 'playerInv', quantity: 2 },
        });

        expect(next.world.inventories.roomInv.items.coin).to.equal(1);
        expect(next.world.inventories.playerInv.items.coin).to.equal(2);
    });

    it('removes source entry when transferring entire stack', () => {
        const state = baseState();

        const next = applyTransfer(state, {
            type: ActionType.TRANSFER,
            data: { itemId: 'coin', fromInventoryId: 'roomInv', toInventoryId: 'playerInv', quantity: 3 },
        });

        expect(next.world.inventories.roomInv.items.coin).to.be.undefined;
    });

    it('clamps quantity to available amount', () => {
        const state = baseState();

        const next = applyTransfer(state, {
            type: ActionType.TRANSFER,
            data: { itemId: 'coin', fromInventoryId: 'roomInv', toInventoryId: 'playerInv', quantity: 10 },
        });

        expect(next.world.inventories.playerInv.items.coin).to.be.undefined;
        expect(next.world.inventories.roomInv.items.coin).to.equal(3);
    });

    it('fails safely when source inventory is missing', () => {
        const state = baseState();

        const next = applyTransfer(state, {
            type: ActionType.TRANSFER,
            data: { itemId: 'coin', fromInventoryId: 'missing', toInventoryId: 'playerInv' },
        });

        expect(next).to.equal(state);
    });

    it('conserves total item quantity', () => {
        const state = baseState();

        const totalBefore = state.world.inventories.roomInv.items.coin;

        const next = applyTransfer(state, {
            type: ActionType.TRANSFER,
            data: { itemId: 'coin', fromInventoryId: 'roomInv', toInventoryId: 'playerInv', quantity: 2 },
        });

        const totalAfter =
            (next.world.inventories.roomInv.items.coin ?? 0) + (next.world.inventories.playerInv.items.coin ?? 0);

        expect(totalAfter).to.equal(totalBefore);
    });

    it('does not mutate the original state', () => {
        const state = deepFreeze(baseState());

        const next = applyTransfer(state, {
            type: ActionType.TRANSFER,
            data: { itemId: 'coin', fromInventoryId: 'roomInv', toInventoryId: 'playerInv', quantity: 1 },
        });

        expect(next).not.to.equal(state);
        expect(state.world.inventories.playerInv.items.coin).to.be.undefined;
    });
});
