import { Action, Outcome } from './action';
import { Effect } from './effect';

export type Event = {
    action: Action;
    outcome: Outcome;
    effects?: Effect[];
};
