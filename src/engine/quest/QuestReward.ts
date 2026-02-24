import { FlagValue } from '../flag';

export interface QuestReward {
    gold?: number;
    itemIds?: string[];
    xp?: number;
    flagsSet?: Record<string, FlagValue>;
    unlocksRoomIds?: string[]; // Rooms made accessible on completion
}
