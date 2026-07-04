import { GameState } from '../../../engine/state';
import { DeepReadonly } from '../../../utils/types';
import { TurnDraft, TurnResult } from '../turn';

export interface NarrationResolver {
    prepare(state: DeepReadonly<GameState>, rawInput: string): TurnDraft;
    resolve(result: TurnResult): string;
}
