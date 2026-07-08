import { NpcMood } from '../../state/npc';
import { Evaluator } from '../Evaluator';

export type NpcMoodCondition = { type: 'npc_mood'; npcId: string; mood: NpcMood };

export const evalNpcMood: Evaluator<NpcMoodCondition> = (ctx, { npcId, mood }) => {
    const npc = ctx.npc(npcId);
    return npc ? npc.mood === mood : false;
};
