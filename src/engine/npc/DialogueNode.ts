import { Condition } from '../condition/Condition';
import { DialogueHint } from './DialogueHint';

export interface DialogueNode {
    id: string;
    description: string; // What's changed about the NPC's disposition at this node
    unlocksTopics?: string[]; // knowledgeTopics available once this node is active
    hintsOverride?: DialogueHint[]; // Replace default hints at this node
    activationCondition?: Condition;
}
