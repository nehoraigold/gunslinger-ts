import { NpcMood } from './NpcMood';

export type NpcState = {
    name: string;
    appearance: string;
    dialogue: string;
    money: number;
    mood: NpcMood;
    health: number;
};
