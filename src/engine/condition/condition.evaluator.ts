import { Condition, FlagCondition, HasItemCondition, LacksItemCondition } from './condition';
import { GameState } from '../game.state';

export const evaluateCondition = (state: GameState, condition: Condition): boolean => {
    switch (condition.type) {
        case 'true':
            return true;
        case 'false':
            return false;
        case 'and':
            return condition.conditions.every((c) => evaluateCondition(state, c));
        case 'or':
            return condition.conditions.some((c) => evaluateCondition(state, c));
        case 'has_item':
            return evaluateHasItem(state, condition);
        case 'lacks_item':
            return evaluateLacksItem(state, condition);
        case 'flag':
            return evaluateFlag(state, condition);
    }
};

const evaluateHasItem = (
    { world }: GameState,
    { inventoryId, itemId, quantity, comparison }: HasItemCondition,
): boolean => {
    const inventory = world.inventories[inventoryId];
    if (!inventory) {
        return false;
    }
    switch (comparison) {
        case 'at_least':
            return inventory.items[itemId] >= quantity;
        case 'exactly':
            return inventory.items[itemId] === quantity;
        case 'at_most':
            return inventory.items[itemId] <= quantity;
    }
};

const evaluateLacksItem = (state: GameState, condition: LacksItemCondition): boolean => {
    const inventory = state.world.inventories[condition.inventoryId];
    if (!inventory) {
        return true;
    }
    return !inventory.items[condition.itemId] || inventory.items[condition.itemId] === 0;
};

const evaluateFlag = ({ world }: GameState, { flag, value }: FlagCondition): boolean => {
    return world.flags[flag] === value;
};
