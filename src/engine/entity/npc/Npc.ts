import { NpcId } from '../../state';
import { Wallet } from '../wallet';

export interface Npc {
    readonly id: NpcId;
    readonly name: string;
    readonly appearance: string;
    readonly dialogue: string;
    wallet(): Wallet;
}
