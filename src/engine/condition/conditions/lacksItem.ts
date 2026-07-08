import { Evaluator } from '../Evaluator';
import { ItemLocation, quantityInLocation } from './itemQuantity';

export type LacksItemCondition = { type: 'lacks_item'; itemId: string; location: ItemLocation; roomId?: string };

export const evalLacksItem: Evaluator<LacksItemCondition> = (ctx, { itemId, location, roomId }) =>
    quantityInLocation(ctx, itemId, location, roomId) === 0;
