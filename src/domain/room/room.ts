import { Direction } from '../../engine';

export type Room = {
    id: string;
    name: string;
    description: string;
    visited: boolean;
    exits: Partial<Record<Direction, string>>;
    inventoryId: string;
    npcIds: string[];
};
