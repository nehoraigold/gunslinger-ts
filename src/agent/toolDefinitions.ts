import { z } from 'zod';
import { actionRegistry } from '../engine/actions/actionRegistry';
import { LlmTool } from './llm/LlmClient';

const EMPTY_OBJECT_SCHEMA: Record<string, unknown> = { type: 'object', properties: {} };

function toJsonSchema(schema: z.ZodSchema): Record<string, unknown> {
    // z.void() cannot be represented in JSON Schema — substitute an empty object
    if (schema instanceof z.ZodVoid) return EMPTY_OBJECT_SCHEMA;
    return z.toJSONSchema(schema) as Record<string, unknown>;
}

export function buildToolDefinitions(): LlmTool[] {
    return Object.entries(actionRegistry).map(([name, { action, description }]) => ({
        name,
        description: description ?? name,
        inputSchema: toJsonSchema(action.inputSchema),
    }));
}
