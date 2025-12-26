import { TransferAction, TransferLocation } from '../action';
import { GameState } from '../engine';

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

export const applyTransfer = (state: GameState, action: TransferAction): GameState => {
    const { item, from, to, quantity } = action.data;
    const inventories = state.world.inventories;

    const fromInventoryId = getInventoryId(from, state);
    const toInventoryId = getInventoryId(to, state);
    if (!fromInventoryId || !toInventoryId) {
        // could not find inventory ids
        return state;
    }

    const source = inventories[fromInventoryId];
    const target = inventories[toInventoryId];

    if (!source || !target) {
        // could not find inventories
        return state;
    }

    const itemId = getItemId(item, state);
    if (!itemId) {
        // could not find item id
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
