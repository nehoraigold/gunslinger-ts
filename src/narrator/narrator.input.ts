import { NarratorGameState } from './narrator.state';
import { ResolvedAction } from '../action';

export type NarratorInput = {
    before_state: NarratorGameState;
    after_state: NarratorGameState;
    resolved_actions: ResolvedAction[];
};
