import { Evaluator } from '../Evaluator';
import { ConditionOutcome } from '../ConditionOutcome';

export type NpcAliveCondition = { type: 'npc_alive'; npcId: string };

export const evalNpcAlive: Evaluator<NpcAliveCondition> = (ctx, condition) => {
    const npc = ctx.npc(condition.npcId);
    return npc && npc.isAlive() ? ConditionOutcome.satisfied() : ConditionOutcome.unmetBy(condition);
};
