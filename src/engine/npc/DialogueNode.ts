import { DialogueHint } from './DialogueHint';

// Named position in an NPC's story arc.
// StateManager advances dialogueNode based on game events.
export interface DialogueNode {
    id: string; // e.g. "initial", "post_quest_offered", "post_betrayal"
    description: string; // What's changed about the NPC's disposition at this node
    unlocksTopics?: string[]; // Additional knowledgeTopics available at this node
    hintsOverride?: DialogueHint[]; // Replace default hints at this node
}
