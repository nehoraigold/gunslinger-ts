import { TransferAction, TransferLocation } from '../action';
import { GameState } from '../engine';
import { ReducerResult } from './reducer.result';

const getInventoryId = (transferLocation: TransferLocation, { player, world }: GameState): string => {
    if (transferLocation === 'player') {
        return player.inventoryId;
    }
    if (transferLocation === 'room') {
        return world.rooms[player.currentRoomId]?.inventoryId ?? '';
    }
    if (!transferLocation.startsWith('npc:')) {
        // unknown!
        return '';
    }
    const npcName = transferLocation.replace(/^npc:/, '');
    const npc = Object.values(world.npcs).find((npc) => npc.name === npcName);
    if (!npc) {
        // npc not found
        return '';
    }
    if (!world.rooms[player.currentRoomId]?.npcIds.includes(npc.id)) {
        // npc not in current room
        return '';
    }
    return npc.inventoryId ?? '';
};

const getItemId = (itemName: string, { world }: GameState): string => {
    return Object.values(world.items).find(({ name }) => name === itemName)?.id || '';
};

export const applyTransfer = (state: GameState, action: TransferAction): ReducerResult => {
    const { item, from, to, quantity } = action.data;
    const inventories = state.world.inventories;

    const fromInventoryId = getInventoryId(from, state);
    const toInventoryId = getInventoryId(to, state);
    if (!fromInventoryId || !toInventoryId) {
        const reason = [
            !!fromInventoryId ? null : 'from_cannot_hold_items',
            !!toInventoryId ? null : 'to_cannot_hold_items',
        ].filter((r) => r !== null);
        return {
            state,
            outcome: {
                result: 'no_change',
                reasons: reason,
            },
        };
    }

    const source = inventories[fromInventoryId];
    const target = inventories[toInventoryId];

    if (!source || !target) {
        const reason = [!!source ? null : 'no_from_inventory_found', !!target ? null : 'no_to_inventory_found'].filter(
            (r) => r !== null,
        );
        return {
            state,
            outcome: {
                result: 'invalid',
                reasons: reason,
            },
        };
    }

    const itemId = getItemId(item, state);
    if (!itemId) {
        return {
            state,
            outcome: {
                result: 'invalid',
                reasons: ['item_does_not_exist'],
            },
        };
    }

    const sourceItemQty = source.items[itemId];
    if (!sourceItemQty) {
        return {
            state,
            outcome: {
                result: 'no_change',
                reasons: ['item_not_found_in_from_inventory'],
            },
        };
    }

    const qtyToTransfer = quantity ?? 1;
    if (!qtyToTransfer || sourceItemQty < qtyToTransfer) {
        return {
            state,
            outcome: {
                result: 'no_change',
                reasons: ['item_quantity_insufficient'],
            },
        };
    }

    const newSourceItemQty = sourceItemQty - qtyToTransfer;
    const newTargetItemQty = (target.items[itemId] ?? 0) + qtyToTransfer;

    const sourceItems = {
        ...source.items,
        [itemId]: newSourceItemQty,
    };
    if (newSourceItemQty === 0) {
        delete sourceItems[itemId];
    }

    const targetItems = {
        ...target.items,
        [itemId]: newTargetItemQty,
    };

    const newState: GameState = {
        ...state,
        world: {
            ...state.world,
            inventories: {
                ...inventories,
                [fromInventoryId]: { ...source, items: sourceItems },
                [toInventoryId]: { ...target, items: targetItems },
            },
        },
    };

    return {
        state: newState,
        outcome: {
            result: 'success',
        },
    };
};
