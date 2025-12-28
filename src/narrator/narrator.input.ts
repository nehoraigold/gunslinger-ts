import { NarratorGameState } from './narrator.state';
import { Action } from '../action';
import { Outcome } from '../engine';

export type NarratorInput = {
    before_state: NarratorGameState;
    after_state: NarratorGameState;
    action: Action;
    outcome: Outcome;
};
