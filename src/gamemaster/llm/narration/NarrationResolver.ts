import { GameState } from '../../../engine/state';
import { DeepReadonly } from '../../../utils/types';
import { LLMRequest } from '../LLMRequest';
import { ConversationMessage } from '../conversation';

export type PreparedTurn = {
    priorMessages: ConversationMessage[];
    request: LLMRequest;
    messages: ConversationMessage[];
};

export type ResolvedTurn = {
    text: string;
    messages: ConversationMessage[];
};

export interface NarrationResolver {
    prepare(state: DeepReadonly<GameState>, rawInput: string): PreparedTurn;
    resolve(result: ResolvedTurn): string;
}
