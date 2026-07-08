import { Evaluator } from '../Evaluator';

export type RoomVisitedCondition = { type: 'room_visited'; roomId: string };

export const evalRoomVisited: Evaluator<RoomVisitedCondition> = (ctx, { roomId }) => ctx.room(roomId)?.visited ?? false;
