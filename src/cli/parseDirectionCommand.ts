import { Direction } from '../engine/state';

const DIRECTION_BY_WORD: Record<string, Direction> = {
    north: 'north',
    n: 'north',
    south: 'south',
    s: 'south',
    east: 'east',
    e: 'east',
    west: 'west',
    w: 'west',
    up: 'up',
    u: 'up',
    down: 'down',
    d: 'down',
};

export function parseDirectionCommand(line: string): Direction | undefined {
    const words = line.trim().toLowerCase().split(/\s+/);
    const lastWord = words[words.length - 1];
    return lastWord ? DIRECTION_BY_WORD[lastWord] : undefined;
}
