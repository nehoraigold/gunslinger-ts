import { ExitState } from '../exit';
import { InventoryState } from '../inventory';
import { NpcId } from '../npc';
import { LightLevel } from './LightLevel';
import { Condition } from '../../condition/Condition';

export type RoomState = {
    name: string;
    description: string;
    lightLevel: LightLevel;
    visited: boolean;
    exits: ExitState[];
    inventory: InventoryState;
    npcIds: NpcId[];
    entryCondition?: Condition;
};
