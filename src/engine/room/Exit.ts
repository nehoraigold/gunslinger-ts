import { FlagValue } from '../flag';
import { Direction } from './Direction';

export interface Exit {
    direction: Direction;
    destinationRoomId: string;

    // Whether this exit is currently traversable
    isBlocked: boolean;

    // What's blocking it, if blocked. Human-readable.
    // e.g. "A locked iron gate", "A collapsed ceiling"
    blockReason?: string;

    // What the exit looks like from this side (used in lookExit)
    description: string;

    // Whether the destination room name is knowable from this side
    // (false for unmarked doors, secret passages)
    destinationKnown: boolean;

    // Optional flavor hint shown in lookRoom exit list
    // e.g. "the door stands open", "cool air flows from beyond"
    hint?: string;

    // Flag-based unlock condition
    // If set, the exit is blocked until this flag matches
    unlockCondition?: {
        flagKey: string;
        flagValue: FlagValue;
    };
}
