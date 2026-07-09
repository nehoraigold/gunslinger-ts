import { GameState } from '../state';
import { DeepReadonly } from '../../utils/types';

export interface RestorableSession {
    getState(): DeepReadonly<GameState>;

    restoreState(state: GameState): void;
}
