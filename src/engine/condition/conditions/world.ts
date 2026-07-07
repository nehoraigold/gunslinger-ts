import { Context } from '../../context';
import { RoomVisitedCondition, NpcMoodCondition, NpcAliveCondition } from '../Condition';

/** Room has been observed at least once. An unknown room is treated as unvisited. */
export const evalRoomVisited = (ctx: Context, { roomId }: RoomVisitedCondition): boolean =>
    ctx.room(roomId)?.visited ?? false;

/** NPC exists and currently holds the given mood. */
export const evalNpcMood = (ctx: Context, { npcId, mood }: NpcMoodCondition): boolean => {
    const npc = ctx.npc(npcId);
    return npc ? npc.mood === mood : false;
};

/** NPC exists and is alive. An unknown NPC is treated as not alive. */
export const evalNpcAlive = (ctx: Context, { npcId }: NpcAliveCondition): boolean => {
    const npc = ctx.npc(npcId);
    return npc ? npc.isAlive() : false;
};
