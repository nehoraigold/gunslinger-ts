import { Condition } from '../condition/Condition';

// A topic the NPC knows about. Structured for precision.
// The LLM may only reveal content for topics in this array.
export interface KnowledgeTopic {
    topic: string; // Identifier. e.g. "crypt_location", "kings_secret"
    content: string; // What the NPC actually knows. Used to inform LLM generation.
    revealCondition?: Condition; // Optional: topic only available if condition is met
}
