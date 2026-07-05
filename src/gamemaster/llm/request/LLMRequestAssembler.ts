import { LLMRequest } from '../LLMRequest';
import { TurnDraft } from '../turn';

export interface AssembleOptions {
    /** When false the request offers no tools, forcing the model to respond with narration. Defaults to true. */
    includeTools?: boolean;
}

export interface LLMRequestAssembler {
    assemble(turn: TurnDraft, options?: AssembleOptions): LLMRequest;
}
