// Lightweight version for checkStatus() return
import { QuestStage } from './QuestStage';

export interface QuestSummary {
    id: string;
    name: string;
    currentObjective: string; // Description of the current objective
    stage: QuestStage;
    isComplete: boolean;
}
