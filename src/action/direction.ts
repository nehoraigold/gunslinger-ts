//region imports
import { Coordinate } from "../utils/coordinate";
//endregion

export type Direction = 'north' | 'south' | 'west' | 'east';

export const directionToCoordinate = (direction: Direction): Coordinate => {
    switch (direction) {
        case 'east': return { x: 1, y: 0 };
        case 'west': return { x: -1, y: 0 };
        case 'north': return { x: 0, y: -1 };
        case 'south': return { x: 0, y: 1 };
        default: throw new Error(`unable to parse direction ${direction}`);
    }
}


