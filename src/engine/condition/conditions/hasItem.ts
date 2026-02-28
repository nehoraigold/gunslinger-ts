import { GameState } from '../../state/GameState';

/**
 * Player's inventory or a specific room contains (at least / exactly / at most) N of an item.
 * When location is 'room' and roomId is omitted, the player's current room is used.
 */
export type HasItemCondition = {
    type: 'has_item';
    itemId: string;
    location: 'player' | 'room';
    roomId?: string;
    comparison: 'at_least' | 'exactly' | 'at_most';
    quantity: number;
};

const countIn = (inv: Record<string, number>, itemId: string): number => inv[itemId] ?? 0;

const compareQty = (actual: number, comparison: HasItemCondition['comparison'], quantity: number): boolean => {
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
    state: GameState,
    { itemId, location, roomId, comparison, quantity }: HasItemCondition,
): boolean => {
    if (location === 'player') {
        return compareQty(countIn(state.player.inventory, itemId), comparison, quantity);
    }
    const room = state.world.rooms[roomId ?? state.player.currentRoomId];
    return room ? compareQty(countIn(room.items, itemId), comparison, quantity) : false;
};
