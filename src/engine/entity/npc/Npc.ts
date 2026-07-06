import { NpcId } from '../../state';

export interface Npc {
    readonly id: NpcId;
    readonly name: string;
    readonly appearance: string;
    readonly dialogue: string;
}
