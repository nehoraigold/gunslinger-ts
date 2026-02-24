import { QuestStage } from './QuestStage';
import { QuestObjective } from './QuestObjective';
import { QuestReward } from './QuestReward';
import { ObjectiveCondition } from './ObjectiveCondition';

export interface Quest {
    id: string;
    name: string;
    description: string; // Full quest description
    giverNpcId?: string; // NPC who offered the quest

    stage: QuestStage;
    objectives: QuestObjective[];
    currentObjectiveIndex: number; // Index into objectives array

    reward: QuestReward;

    // Whether failing this quest has consequences
    isFailable: boolean;
    failCondition?: ObjectiveCondition;

    // Metadata
    startedAtTurn?: number;
    completedAtTurn?: number;
    failedAtTurn?: number;
}
