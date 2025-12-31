import { NarratorGameState } from './narrator.state';
import { Event } from '../engine';

export type NarratorInput = {
    before_state: NarratorGameState;
    after_state: NarratorGameState;
    events: Event[];
};
