import { InstructionsProvider } from './InstructionsProvider';

export class StaticInstructionsProvider implements InstructionsProvider {
    constructor(private readonly content: string) {}

    getSystemPrompt(): string {
        return this.content;
    }
}
