import { DialogueHint } from './DialogueHint';

export interface DialogueNode {
    id: string;
    description: string; // What's changed about the NPC's disposition at this node
    unlocksTopics?: string[]; // knowledgeTopics available once this node is active
    hintsOverride?: DialogueHint[]; // Replace default hints at this node
    activationCondition?: {
        type: 'flag' | 'npc_trust' | 'room_visited';
        key?: string;
        value?: string | boolean | number;
        npcId?: string;
        minScore?: number;
    };
}
