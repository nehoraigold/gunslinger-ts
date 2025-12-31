import { TransferAction, TransferLocation } from '../../action';
import { GameState } from '../../game.state';
import { Decision } from '../decision';

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

export const resolveTransferAction = (state: GameState, action: TransferAction): Decision => {
    const { item, from, to, quantity } = action.data;
    const inventories = state.world.inventories;

    const fromInventoryId = getInventoryId(from, state);
    const source = inventories[fromInventoryId];
    if (!source) {
        return {
            outcome: {
                result: 'error',
                reasons: [{ message: 'invalid_transfer_location', context: { transferLocation: from } }],
            },
        };
    }
    const toInventoryId = getInventoryId(to, state);
    const target = inventories[toInventoryId];
    if (!target) {
        return {
            outcome: {
                result: 'error',
                reasons: [{ message: 'invalid_transfer_location', context: { transferLocation: to } }],
            },
        };
    }

    const itemId = getItemId(item, state);
    if (!itemId) {
        return {
            outcome: {
                result: 'error',
                reasons: [{ message: 'item_does_not_exist', context: { item } }],
            },
        };
    }

    const actualQuantity = source.items[itemId];
    if (!actualQuantity) {
        return {
            outcome: {
                result: 'failure',
                reasons: [{ message: 'item_not_found_in_inventory', context: { from, item } }],
            },
        };
    }

    const expectedQuantity = quantity ?? 1;
    if (!expectedQuantity || actualQuantity < expectedQuantity) {
        return {
            outcome: {
                result: 'failure',
                reasons: [
                    {
                        message: 'item_quantity_insufficient',
                        context: { from, item, expectedQuantity, actualQuantity },
                    },
                ],
            },
        };
    }

    const newSourceItemQty = actualQuantity - expectedQuantity;
    const newTargetItemQty = (target.items[itemId] ?? 0) + expectedQuantity;

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
        outcome: {
            result: 'success',
        },
        effects: [
            {
                type: 'set_item_quantity',
                inventoryId: fromInventoryId,
                itemId,
                quantity: newSourceItemQty,
            },
            {
                type: 'set_item_quantity',
                inventoryId: toInventoryId,
                itemId,
                quantity: newTargetItemQty,
            },
        ],
    };
};
