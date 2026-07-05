import { ExitState } from '../exit';
import { InventoryState } from '../inventory';
import { LightLevel } from './LightLevel';

export type RoomState = {
    name: string;
    description: string;
    lightLevel: LightLevel;
    // Whether the player has observed this room before; flipped by the look action, not by movement.
    visited: boolean;
    exits: ExitState[];
    inventory: InventoryState;
};
