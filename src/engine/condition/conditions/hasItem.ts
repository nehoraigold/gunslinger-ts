import { Evaluator } from '../Evaluator';
import { ItemLocation, QuantityComparison, quantityInLocation } from './itemQuantity';

export type HasItemCondition = {
    type: 'has_item';
    itemId: string;
    location: ItemLocation;
    roomId?: string;
    comparison: QuantityComparison;
    quantity: number;
};

const compare = (actual: number, comparison: QuantityComparison, quantity: number): boolean => {
    switch (comparison) {
        case 'at_least':
            return actual >= quantity;
        case 'exactly':
            return actual === quantity;
        case 'at_most':
            return actual <= quantity;
    }
};

export const evalHasItem: Evaluator<HasItemCondition> = (ctx, { itemId, location, roomId, comparison, quantity }) =>
    compare(quantityInLocation(ctx, itemId, location, roomId), comparison, quantity);
