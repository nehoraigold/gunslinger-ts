import { TransferAction } from '../action';
import { GameState } from '../engine';

export const applyTransfer = (state: GameState, action: TransferAction): GameState => {
    const { itemId, fromInventoryId, toInventoryId, quantity } = action.data;
    const inventories = state.world.inventories;

    const source = inventories[fromInventoryId];
    const target = inventories[toInventoryId];

    if (!source || !target) {
        // source or target inventories not found
        return state;
    }

    const sourceItemQty = source.items[itemId];
    if (!sourceItemQty) {
        // item does not exist in source inventory
        return state;
    }

    const qtyToTransfer = quantity ?? 1;
    if (!qtyToTransfer || sourceItemQty < qtyToTransfer) {
        // source inventory does not have enough to transfer
        return state;
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

    return {
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
};
