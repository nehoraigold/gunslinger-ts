import { Condition } from '../condition/Condition';

// A hard constraint on NPC dialogue for this conversation.
// "Will lie about her name" → LLM must generate a false name.
// "Won't discuss the king until trust > 50" → deflect king questions.
export interface DialogueHint {
    hint: string; // Natural language constraint for the LLM
    condition?: Condition; // Optional: hint only applies if condition is met
}
