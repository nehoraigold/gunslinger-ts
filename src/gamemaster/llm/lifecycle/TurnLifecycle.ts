import { GameState } from '../../../engine/state';
import { DeepReadonly } from '../../../utils/types';
import { TurnDraft, TurnResult } from '../turn';

export interface TurnLifecycle {
    begin(state: DeepReadonly<GameState>, rawInput: string): TurnDraft;
    end(result: TurnResult): string;
}
