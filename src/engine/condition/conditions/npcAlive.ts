import { Evaluator } from '../Evaluator';

export type NpcAliveCondition = { type: 'npc_alive'; npcId: string };

export const evalNpcAlive: Evaluator<NpcAliveCondition> = (ctx, { npcId }) => {
    const npc = ctx.npc(npcId);
    return npc ? npc.isAlive() : false;
};
