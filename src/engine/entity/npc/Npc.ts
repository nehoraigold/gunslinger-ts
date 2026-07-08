import { NpcId, NpcMood } from '../../state';
import { Wallet } from '../wallet';

export interface Npc {
    readonly id: NpcId;
    readonly name: string;
    readonly appearance: string;
    readonly dialogue: string;
    readonly mood: NpcMood;
    isAlive(): boolean;
    wallet(): Wallet;
}
