import { GameState } from '../../game.state';
import { UseItemAction } from '../../action';
import { Decision } from '../decision';
import { Effect } from '../../effect';
import { Condition, evaluateCondition } from '../../condition';

export const resolveUseItemAction = (state: GameState, action: UseItemAction): Decision => {
    const { verb, itemId, targetId, inventoryType } = action.data;
    const item = state.world.items[itemId];
    if (!item) {
        return {
            outcome: {
                result: 'error',
                reasons: [{ messageKey: `${itemId}_does_not_exist` }],
            },
        };
    }

    const inventory = getInventory(state, inventoryType);
    if (!inventory) {
        return {
            outcome: {
                result: 'error',
                reasons: [{ messageKey: `${inventoryType}_inventory_not_found` }],
            },
        };
    }

    const quantity = inventory.items[itemId];
    if (!quantity || quantity <= 0) {
        return {
            outcome: {
                result: 'error',
                reasons: [{ messageKey: `${itemId}_not_in_${inventory.id}` }],
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

    const condition = finalizeUseItemCondition(itemUse.condition, itemId, inventoryType, inventory.id, targetId);
    const result = evaluateCondition(state, condition);
    if (!result.ok) {
        return { outcome: { result: 'failure', reasons: result.reasons } };
    }

    const effects = finalizeUseItemEffects(itemUse.effects, itemId, inventoryType, inventory.id, targetId);
    return { outcome: { result: 'success' }, effects };
};

const getInventory = (state: GameState, inventoryType: 'player' | 'room') => {
    switch (inventoryType) {
        case 'player':
            return state.world.inventories[state.player.inventoryId];
        case 'room':
            return state.world.rooms[state.player.currentRoomId]?.inventoryId
                ? state.world.inventories[state.world.rooms[state.player.currentRoomId]?.inventoryId]
                : undefined;
        default:
            return undefined;
    }
};

const finalizeUseItemCondition = (
    condition: Condition,
    itemId: string,
    inventoryType: 'player' | 'room',
    inventoryId: string,
    targetId: string | undefined,
): Condition => {
    return JSON.parse(
        JSON.stringify(condition)
            .replace(/\$targetId/g, targetId ?? 'undefined')
            .replace(/\$itemId/g, itemId)
            .replace(/\$inventoryId/g, inventoryId)
            .replace(/\$inventoryType/g, inventoryType),
    );
};

const finalizeUseItemEffects = (
    effects: Effect[],
    itemId: string,
    inventoryType: 'player' | 'room',
    inventoryId: string,
    targetId: string | undefined,
): Effect[] => {
    return effects.map((effect) => {
        return JSON.parse(
            JSON.stringify(effect)
                .replace(/\$targetId/g, targetId ?? 'undefined')
                .replace(/\$itemId/g, itemId)
                .replace(/\$inventoryId/g, inventoryId)
                .replace(/\$inventoryType/g, inventoryType),
        );
    });
};
