import { ExitState } from '../exit';
import { InventoryState } from '../inventory';

export type RoomState = {
    name: string;
    description: string;
    exits: ExitState[];
    inventory: InventoryState;
};
