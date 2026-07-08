import { Evaluator } from '../Evaluator';
import { satisfied, unmetBy } from '../ConditionOutcome';

export type NpcAliveCondition = { type: 'npc_alive'; npcId: string };

export const evalNpcAlive: Evaluator<NpcAliveCondition> = (ctx, condition) => {
    const npc = ctx.npc(condition.npcId);
    return npc && npc.isAlive() ? satisfied : unmetBy(condition);
};
