import { TransferAction } from '../../action';
import { GameState } from '../../game.state';
import { Decision } from '../decision';
import { Condition, evaluateCondition } from '../../condition';

export const resolveTransferAction = (state: GameState, action: TransferAction): Decision => {
    const { itemId, fromInventoryId, toInventoryId, quantity } = action.data;
    const expectedQuantity = quantity ?? 1;

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

    const item = state.world.items[itemId];
    if (!itemId || !item) {
        return {
            outcome: {
                result: 'error',
                reasons: [{ messageKey: `${itemId}_does_not_exist` }],
            },
        };
    }

    const transferableCondition = finalizeTransferableCondition(
        item.transferable,
        state.player.inventoryId,
        fromInventoryId,
        toInventoryId,
        itemId,
        expectedQuantity,
    );
    const result = evaluateCondition(state, transferableCondition);

    if (!result.ok) {
        return {
            outcome: {
                result: 'failure',
                reasons: result.reasons,
            },
        };
    }

    const actualQuantity = source.items[itemId];
    if (!actualQuantity) {
        return {
            outcome: {
                result: 'failure',
                reasons: [{ messageKey: `${itemId}_not_found_in_${fromInventoryId}` }],
            },
        };
    }

    if (!expectedQuantity || actualQuantity < expectedQuantity) {
        return {
            outcome: {
                result: 'failure',
                reasons: [
                    {
                        messageKey: `${itemId}_quantity_insufficient`,
                        context: { fromInventoryId, expectedQuantity, actualQuantity },
                    },
                ],
            },
        };
    }

    return {
        outcome: {
            result: 'success',
        },
        effects: [
            {
                type: 'remove_item',
                inventoryId: fromInventoryId,
                itemId,
                quantity: expectedQuantity,
            },
            {
                type: 'add_item',
                inventoryId: toInventoryId,
                itemId,
                quantity: expectedQuantity,
            },
        ],
    };
};

const finalizeTransferableCondition = (
    condition: Condition,
    playerInventoryId: string,
    fromInventoryId: string,
    toInventoryId: string,
    itemId: string,
    quantity: number,
): Condition => {
    return JSON.parse(
        JSON.stringify(condition)
            .replace(/\$fromInventoryId/g, fromInventoryId)
            .replace(/\$toInventoryId/g, toInventoryId)
            .replace(/\$playerInventoryId/g, playerInventoryId)
            .replace(/\$itemId/g, itemId)
            .replace(/\$quantity/g, quantity.toString()),
    );
};
