import { GameState } from '../../game.state';
import { UseItemAction } from '../../action';
import { Decision } from '../decision';
import { Effect } from '../../effect';
import { Condition, evaluateCondition } from '../../condition';

export const resolveUseItemAction = (state: GameState, action: UseItemAction): Decision => {
    const { verb, itemId, targetId } = action.data;
    const item = state.world.items[itemId];
    if (!item) {
        return {
            outcome: {
                result: 'error',
                reasons: [{ messageKey: `${itemId}_does_not_exist` }],
            },
        };
    }

    const playerInventory = state.world.inventories[state.player.inventoryId];
    if (!playerInventory) {
        return {
            outcome: {
                result: 'error',
                reasons: [{ messageKey: 'player_inventory_not_found' }],
            },
        };
    }
    const quantity = playerInventory.items[itemId];
    if (!quantity || quantity <= 0) {
        return {
            outcome: {
                result: 'failure',
                reasons: [{ messageKey: `no_${itemId}_in_inventory` }],
            },
        };
    }

    const itemUse = item.uses.find((use) => use.verb === verb || use.aliases.includes(verb));
    if (!itemUse) {
        return {
            outcome: {
                result: 'failure',
                reasons: [{ messageKey: `cannot_use_${verb}_with_${itemId}` }],
            },
        };
    }

    const condition = finalizeUseItemCondition(itemUse.condition, itemId, state.player.inventoryId, targetId);
    const result = evaluateCondition(state, condition);
    if (!result.ok) {
        return { outcome: { result: 'failure', reasons: result.reasons } };
    }

    const effects = finalizeUseItemEffects(itemUse.effects, itemId, state.player.inventoryId, targetId);
    return { outcome: { result: 'success' }, effects };
};

const finalizeUseItemCondition = (
    condition: Condition,
    itemId: string,
    playerInventoryId: string,
    targetId: string | undefined,
): Condition => {
    return JSON.parse(
        JSON.stringify(condition)
            .replace(/\$targetId/g, targetId ?? 'undefined')
            .replace(/\$itemId/g, itemId)
            .replace(/\$playerInventoryId/g, playerInventoryId),
    );
};

const finalizeUseItemEffects = (
    effects: Effect[],
    itemId: string,
    playerInventoryId: string,
    targetId: string | undefined,
): Effect[] => {
    return effects.map((effect) => {
        return JSON.parse(
            JSON.stringify(effect)
                .replace(/\$targetId/g, targetId ?? 'undefined')
                .replace(/\$itemId/g, itemId)
                .replace(/\$playerInventoryId/g, playerInventoryId),
        );
    });
};
