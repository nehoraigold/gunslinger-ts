import { Action } from './action';
import { Outcome } from './decision';
import { Effect } from './effect';

export type Event = {
    action: Action;
    outcome: Outcome;
    effects?: Effect[];
};
