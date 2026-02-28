import instructionsText from '../../INSTRUCTIONS.md';
import { LlmTool } from './llm/LlmClient';

/**
 * Build the system prompt by injecting a compact tool index into Section 5 of INSTRUCTIONS.md.
 * The index lists each tool name and its description; full input schemas are sent separately
 * via the API tools array.
 */
export function buildSystemPrompt(tools: LlmTool[]): string {
    const toolIndex = tools.map((t) => `- \`${t.name}\`: ${t.description}`).join('\n');
    return instructionsText.replace('## 5. Tool Reference', `## 5. Tool Reference\n\n${toolIndex}\n`);
}
