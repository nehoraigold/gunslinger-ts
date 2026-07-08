import { Evaluator } from '../Evaluator';
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

export const evalHasItem: Evaluator<HasItemCondition> = (ctx, { itemId, location, roomId, comparison, quantity }) =>
    compare(quantityInLocation(ctx, itemId, location, roomId), comparison, quantity);
