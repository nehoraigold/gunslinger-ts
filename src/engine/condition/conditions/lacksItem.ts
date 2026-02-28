import { GameState } from '../../state/GameState';

/**
 * Inverse of has_item (quantity === 0).
 * When location is 'room' and roomId is omitted, the player's current room is used.
 */
export type LacksItemCondition = {
    type: 'lacks_item';
    itemId: string;
    location: 'player' | 'room';
    roomId?: string;
};

const countIn = (inv: Record<string, number>, itemId: string): number => inv[itemId] ?? 0;

export const evalLacksItem = (state: GameState, { itemId, location, roomId }: LacksItemCondition): boolean => {
    if (location === 'player') {
        return countIn(state.player.inventory, itemId) === 0;
    }
    const room = state.world.rooms[roomId ?? state.player.currentRoomId];
    return room ? countIn(room.items, itemId) === 0 : true;
};
