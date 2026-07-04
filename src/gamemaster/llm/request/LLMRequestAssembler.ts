import { LLMRequest } from '../LLMRequest';
import { TurnDraft } from '../turn';

export interface LLMRequestAssembler {
    assemble(turn: TurnDraft): LLMRequest;
}
