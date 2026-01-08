import { Direction } from '../../engine';

export type Room = {
    id: string;
    name: string;
    description: string;
    visitedCount: number;
    lookCount: number;
    exits: Partial<Record<Direction, string>>;
    inventoryId: string;
    npcIds: string[];
};
