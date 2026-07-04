import { GameState } from '../../../engine/state';
import { DeepReadonly } from '../../../utils/types';

export interface WorldSnapshotBuilder {
    build(state: DeepReadonly<GameState>): string;
}
