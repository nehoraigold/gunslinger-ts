import { Context } from '../../context';
import { HasItemCondition, LacksItemCondition, QuantityComparison } from '../Condition';

const quantityInLocation = (ctx: Context, itemId: string, location: 'player' | 'room', roomId?: string): number => {
    if (location === 'player') {
        return ctx.player().inventory().quantityOf(itemId);
    }
    const room = ctx.room(roomId ?? ctx.player().currentRoomId);
    return room?.inventory().quantityOf(itemId) ?? 0;
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

export const evalHasItem = (
    ctx: Context,
    { itemId, location, roomId, comparison, quantity }: HasItemCondition,
): boolean => compare(quantityInLocation(ctx, itemId, location, roomId), comparison, quantity);

export const evalLacksItem = (ctx: Context, { itemId, location, roomId }: LacksItemCondition): boolean =>
    quantityInLocation(ctx, itemId, location, roomId) === 0;
