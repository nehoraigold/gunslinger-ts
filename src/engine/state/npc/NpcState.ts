import { NpcMood } from './NpcMood';
import { ShopState } from './ShopState';
import { InventoryState } from '../inventory';

export type NpcState = {
    name: string;
    appearance: string;
    dialogue: string;
    money: number;
    mood: NpcMood;
    health: number;
    inventory: InventoryState;
    shop?: ShopState;
};
