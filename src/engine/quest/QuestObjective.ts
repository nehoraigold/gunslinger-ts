import { ObjectiveCondition } from './ObjectiveCondition';

export interface QuestObjective {
    id: string;
    description: string; // e.g. "Find the missing heir"
    isComplete: boolean;

    // Completion condition checked by StateManager
    completionCondition: ObjectiveCondition;
}
