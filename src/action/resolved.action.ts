import { Outcome } from '../engine';
import { Action } from './action';

export type ResolvedAction = {
    action: Action;
    outcome: Outcome;
};
