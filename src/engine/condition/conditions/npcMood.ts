import { NpcMood } from '../../state/npc';
import { Evaluator } from '../Evaluator';
import { ConditionOutcome } from '../ConditionOutcome';

export type NpcMoodCondition = { type: 'npc_mood'; npcId: string; mood: NpcMood };

export const evalNpcMood: Evaluator<NpcMoodCondition> = (ctx, condition) => {
    const npc = ctx.npc(condition.npcId);
    return npc && npc.mood === condition.mood ? ConditionOutcome.satisfied() : ConditionOutcome.unmetBy(condition);
};
