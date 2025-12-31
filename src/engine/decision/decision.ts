import { Outcome } from '../action';
import { Effect } from '../effect';

export type Decision = {
    outcome: Outcome;
    effects?: Effect[];
};
