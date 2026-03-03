import { Condition } from '../condition/Condition';
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

    // Condition that, when true, means the exit can be unblocked.
    // Evaluated by the unlock effect handler to find matching exits.
    unlockCondition?: Condition;

    // Condition that, when true, dynamically blocks this exit regardless of isBlocked.
    // Unlike isBlocked (which is toggled permanently by unlock), blockCondition is
    // re-evaluated each move attempt. Use for state-dependent barriers:
    // e.g. "can't enter tavern while carrying a mule"
    blockCondition?: Condition;

    // Human-readable reason shown when blockCondition evaluates to true.
    // Falls back to blockReason if absent.
    blockConditionReason?: string;
}
