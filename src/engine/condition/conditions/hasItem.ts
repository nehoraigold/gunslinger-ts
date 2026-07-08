import { Evaluator } from '../Evaluator';
import { ConditionOutcome } from '../ConditionOutcome';
import { Comparison, compare } from '../comparison';
import { ItemLocation, quantityInLocation } from './itemQuantity';

export type HasItemCondition = {
    type: 'has_item';
    itemId: string;
    location: ItemLocation;
    roomId?: string;
    comparison: Comparison;
    quantity: number;
};

export const evalHasItem: Evaluator<HasItemCondition> = (ctx, condition) => {
    const { itemId, location, roomId, comparison, quantity } = condition;
    const met = compare(quantityInLocation(ctx, itemId, location, roomId), comparison, quantity);
    return met ? ConditionOutcome.satisfied() : ConditionOutcome.unmetBy(condition);
};
