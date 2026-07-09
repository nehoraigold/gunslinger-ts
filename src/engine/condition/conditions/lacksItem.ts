import { Evaluator } from '../Evaluator';
import { ConditionOutcome } from '../ConditionOutcome';
import { ItemLocation, quantityInLocation } from './itemQuantity';

export type LacksItemCondition = { type: 'lacks_item'; itemId: string; location: ItemLocation; roomId?: string };

export const evalLacksItem: Evaluator<LacksItemCondition> = (ctx, condition) => {
    const { itemId, location, roomId } = condition;
    return quantityInLocation(ctx, itemId, location, roomId) === 0
        ? ConditionOutcome.satisfied()
        : ConditionOutcome.unmetBy(condition);
};
