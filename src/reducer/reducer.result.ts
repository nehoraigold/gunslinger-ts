import { GameState, Outcome } from '../engine';

export type ReducerResult = {
    state: GameState;
    outcome: Outcome;
};
