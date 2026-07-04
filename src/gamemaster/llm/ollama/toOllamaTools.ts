import { Tool as OllamaTool } from 'ollama';
import { ToolDefinition } from '../tool';

export function toOllamaTools(definitions: ToolDefinition[]): OllamaTool[] {
    return definitions.map((definition) => ({
        type: 'function',
        function: {
            name: definition.name,
            description: definition.description,
            parameters: definition.inputSchema as OllamaTool['function']['parameters'],
        },
    }));
}
