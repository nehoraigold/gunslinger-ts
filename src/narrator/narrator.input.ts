import { NarratorGameState } from './narrator.state';
import { Action } from '../action';

export type NarratorInput = {
    before_state: NarratorGameState;
    after_state: NarratorGameState;
    action: Action;
    action_resolution: string;
};
