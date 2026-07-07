import { ExitState } from '../exit';
import { InventoryState } from '../inventory';
import { NpcId } from '../npc';
import { LightLevel } from './LightLevel';
// Imported from the pure-types module, not the condition barrel, to avoid a cycle
// (the barrel re-exports the Context-aware evaluator).
import { Condition } from '../../condition/Condition';

export type RoomState = {
    name: string;
    description: string;
    lightLevel: LightLevel;
    // Whether the player has observed this room before; flipped by the look action, not by movement.
    visited: boolean;
    exits: ExitState[];
    inventory: InventoryState;
    npcIds: NpcId[];
    // A gate on entering this room from anywhere; unmet ⇒ movement into it is barred.
    entryCondition?: Condition;
};
