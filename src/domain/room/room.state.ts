import { Coordinate } from '../../utils';
import { Direction } from '../../action';
import { ExitState } from './exit.state';

export interface RoomState {
    id: string;
    name: string;
    description: string;
    visited: boolean;
    exits: Partial<Record<Direction, ExitState>>;
    inventoryId: string;
    npcIds: string[];
}
