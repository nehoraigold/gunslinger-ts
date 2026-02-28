import { GameState } from '../../state/GameState';

/** Room has been visited at least once. */
export type RoomVisitedCondition = { type: 'room_visited'; roomId: string };

export const evalRoomVisited = ({ world }: GameState, { roomId }: RoomVisitedCondition): boolean =>
    world.rooms[roomId]?.visited ?? false;
