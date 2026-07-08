import { Context } from '../../context';

export type ItemLocation = 'player' | 'room';
export type QuantityComparison = 'at_least' | 'exactly' | 'at_most';

export const quantityInLocation = (ctx: Context, itemId: string, location: ItemLocation, roomId?: string): number => {
    if (location === 'player') {
        return ctx.player().inventory().quantityOf(itemId);
    }
    const room = ctx.room(roomId ?? ctx.player().currentRoomId);
    return room?.inventory().quantityOf(itemId) ?? 0;
};
