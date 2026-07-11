import { NpcMood } from './NpcMood';
import { ShopState } from './ShopState';

export type NpcState = {
    name: string;
    appearance: string;
    dialogue: string;
    money: number;
    mood: NpcMood;
    health: number;
    shop?: ShopState;
};
