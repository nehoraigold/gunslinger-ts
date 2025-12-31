import { TransferAction } from '../../action';
import { GameState } from '../../game.state';
import { Decision } from '../decision';

// const getInventoryId = (transferLocation: TransferLocation, { player, world }: GameState): string => {
//     if (transferLocation === 'player') {
//         return player.inventoryId;
//     }
//     if (transferLocation === 'room') {
//         return world.rooms[player.currentRoomId]?.inventoryId ?? '';
//     }
//     if (!transferLocation.startsWith('npc:')) {
//         // unknown!
//         return '';
//     }
//     const npcName = transferLocation.replace(/^npc:/, '');
//     const npc = Object.values(world.npcs).find((npc) => npc.name === npcName);
//     if (!npc) {
//         // npc not found
//         return '';
//     }
//     if (!world.rooms[player.currentRoomId]?.npcIds.includes(npc.id)) {
//         // npc not in current room
//         return '';
//     }
//     return npc.inventoryId ?? '';
// };

export const resolveTransferAction = (state: GameState, action: TransferAction): Decision => {
    const { itemId, fromInventoryId, toInventoryId, quantity } = action.data;
    const inventories = state.world.inventories;

    const source = inventories[fromInventoryId];
    if (!source) {
        return {
            outcome: {
                result: 'error',
                reasons: [{ messageKey: 'invalid_transfer_location', context: { fromInventoryId } }],
            },
        };
    }
    const target = inventories[toInventoryId];
    if (!target) {
        return {
            outcome: {
                result: 'error',
                reasons: [{ messageKey: 'invalid_transfer_location', context: { toInventoryId } }],
            },
        };
    }

    if (!itemId) {
        return {
            outcome: {
                result: 'error',
                reasons: [{ messageKey: 'item_does_not_exist', context: { itemId } }],
            },
        };
    }

    const actualQuantity = source.items[itemId];
    if (!actualQuantity) {
        return {
            outcome: {
                result: 'failure',
                reasons: [{ messageKey: 'item_not_found_in_inventory', context: { fromInventoryId, itemId } }],
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
                        messageKey: 'item_quantity_insufficient',
                        context: { fromInventoryId, itemId, expectedQuantity, actualQuantity },
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
