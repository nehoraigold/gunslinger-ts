import { AssembleOptions, LLMRequestAssembler } from './LLMRequestAssembler';
import { InstructionsProvider } from '../instructions';
import { ToolDefinition } from '../tool';
import { LLMRequest } from '../LLMRequest';
import { TurnDraft } from '../turn';

export class DefaultLLMRequestAssembler implements LLMRequestAssembler {
    constructor(
        private readonly instructionsProvider: InstructionsProvider,
        private readonly toolDefinitions: ToolDefinition[],
    ) {}

    assemble(turn: TurnDraft, options: AssembleOptions = {}): LLMRequest {
        const includeTools = options.includeTools ?? true;
        return {
            systemPrompt: this.instructionsProvider.getSystemPrompt(),
            messages: turn.toRequestMessages(),
            tools: includeTools ? this.toolDefinitions : [],
        };
    }
}
