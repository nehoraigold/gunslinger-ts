import { Evaluator } from '../Evaluator';
import { satisfied, unmetBy } from '../ConditionOutcome';

export type RoomVisitedCondition = { type: 'room_visited'; roomId: string };

export const evalRoomVisited: Evaluator<RoomVisitedCondition> = (ctx, condition) =>
    (ctx.room(condition.roomId)?.visited ?? false) ? satisfied : unmetBy(condition);
