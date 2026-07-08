import { Evaluator } from '../Evaluator';
import { ConditionOutcome } from '../ConditionOutcome';

export type RoomVisitedCondition = { type: 'room_visited'; roomId: string };

export const evalRoomVisited: Evaluator<RoomVisitedCondition> = (ctx, condition) =>
    (ctx.room(condition.roomId)?.visited ?? false) ? ConditionOutcome.satisfied() : ConditionOutcome.unmetBy(condition);
