import { Direction } from '../../action';

export interface RoomState {
    id: string;
    name: string;
    description: string;
    visited: boolean;
    exits: Partial<Record<Direction, string>>;
    inventoryId: string;
    npcIds: string[];
}
