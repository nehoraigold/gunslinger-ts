import {
    AndCondition,
    Condition,
    ExitStateCondition,
    FalseCondition,
    FlagCondition,
    HasItemCondition,
    LacksItemCondition,
    OrCondition,
} from './condition';
import { GameState } from '../game.state';
import { ConditionResult } from './condition.result';
import { ConditionResultReason } from './conditionResultReason';

export const evaluateCondition = (state: GameState, condition: Condition): ConditionResult => {
    switch (condition.type) {
        case 'true':
            return evaluateTrue();
        case 'false':
            return evaluateFalse(condition);
        case 'and':
            return evaluateAnd(state, condition);
        case 'or':
            return evaluateOr(state, condition);
        case 'has_item':
            return evaluateHasItem(state, condition);
        case 'lacks_item':
            return evaluateLacksItem(state, condition);
        case 'flag':
            return evaluateFlag(state, condition);
        case 'exit_state':
            return evaluateExitState(state, condition);
    }
};

const evaluateTrue = (): ConditionResult => {
    return {
        ok: true,
    };
};

const evaluateFalse = (condition: FalseCondition): ConditionResult => {
    return {
        ok: false,
        reasons: [{ condition, messageKey: 'condition_always_false' }],
    };
};

const evaluateAnd = (state: GameState, condition: AndCondition): ConditionResult => {
    const reasons: ConditionResultReason[] = [];

    for (const sub of condition.conditions) {
        const result = evaluateCondition(state, sub);
        if (!result.ok) {
            return result;
        } else if (result.reasons) {
            reasons.push(...result.reasons);
        }
    }

    return { ok: true, reasons };
};

const evaluateOr = (state: GameState, condition: OrCondition): ConditionResult => {
    const failures: ConditionResultReason[] = [];

    for (const sub of condition.conditions) {
        const result = evaluateCondition(state, sub);
        if (result.ok) {
            return { ok: true, reasons: [{ condition: sub, messageKey: 'subcondition_satisfied' }] };
        }
        failures.push(...result.reasons);
    }

    return { ok: false, reasons: failures };
};

const evaluateHasItem = ({ world }: GameState, condition: HasItemCondition): ConditionResult => {
    const { inventoryId, itemId, comparison, quantity } = condition;
    const inventory = world.inventories[inventoryId];
    if (!inventory) {
        return {
            ok: false,
            reasons: [{ condition, messageKey: 'inventory_not_found' }],
        };
    }

    switch (comparison) {
        case 'at_least':
            return evaluateHasItemAtLeast(inventory.items[itemId] ?? 0, condition);
        case 'exactly':
            return evaluateHasItemExactly(inventory.items[itemId] ?? 0, condition);
        case 'at_most':
            return evaluateHasItemAtMost(inventory.items[itemId] ?? 0, condition);
    }
};

const evaluateHasItemAtLeast = (actualQuantity: number, condition: HasItemCondition): ConditionResult => {
    if (actualQuantity >= condition.quantity) {
        return { ok: true, reasons: [] };
    }
    return {
        ok: false,
        reasons: [
            {
                condition,
                messageKey: `not_enough_${condition.itemId}`,
                context: { actual: actualQuantity },
            },
        ],
    };
};

const evaluateHasItemExactly = (actualQuantity: number, condition: HasItemCondition): ConditionResult => {
    if (actualQuantity === condition.quantity) {
        return { ok: true, reasons: [] };
    }
    return {
        ok: false,
        reasons: [
            {
                condition,
                messageKey: `wrong_amount_of_${condition.itemId}`,
                context: { actual: actualQuantity },
            },
        ],
    };
};

const evaluateHasItemAtMost = (actualQuantity: number, condition: HasItemCondition): ConditionResult => {
    if (actualQuantity <= condition.quantity) {
        return { ok: true, reasons: [] };
    }
    return {
        ok: false,
        reasons: [
            {
                condition,
                messageKey: `too_many_${condition.itemId}`,
                context: { actual: actualQuantity },
            },
        ],
    };
};

const evaluateLacksItem = (state: GameState, condition: LacksItemCondition): ConditionResult => {
    const inventory = state.world.inventories[condition.inventoryId];
    if (!inventory) {
        return {
            ok: false,
            reasons: [{ condition, messageKey: 'inventory_not_found' }],
        };
    }
    const ok = !inventory.items[condition.itemId] || inventory.items[condition.itemId] === 0;
    return {
        ok,
        reasons: ok ? [] : [{ condition, messageKey: `${condition.itemId}_in_inventory` }],
    };
};

const evaluateFlag = ({ world }: GameState, condition: FlagCondition): ConditionResult => {
    const { flag, expectedValue } = condition;
    const ok = world.flags[flag] === expectedValue;
    return {
        ok,
        reasons: ok ? [] : [{ condition, messageKey: world.flags[flag] ? 'flag_true' : 'flag_false' }],
    };
};

const evaluateExitState = ({ world }: GameState, condition: ExitStateCondition): ConditionResult => {
    const exit = world.exits[condition.exitId];
    const actualValue = exit.state[condition.stateKey];
    const ok = actualValue === condition.expectedValue;
    return {
        ok,
        reasons: ok
            ? []
            : [
                  {
                      condition,
                      messageKey: `${exit.type}${actualValue ? '_' : '_not_'}${condition.stateKey}`,
                  },
              ],
    };
};
