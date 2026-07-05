import { z } from 'zod';
import { Schema } from './Schema';
import { ParseError } from './ParseError';

const EMPTY_OBJECT_SCHEMA: Record<string, unknown> = { type: 'object', properties: {} };

function isEmptyObject(value: unknown): boolean {
    return typeof value === 'object' && value !== null && !Array.isArray(value) && Object.keys(value).length === 0;
}

export class ZodSchema<T> implements Schema<T> {
    constructor(private readonly schema: z.ZodType<T>) {}

    parse(input: unknown): T {
        try {
            if (this.schema instanceof z.ZodVoid && isEmptyObject(input)) {
                // toJsonSchema advertises void as an empty object, so accept the `{}` a tool-caller sends for it.
                return undefined as T;
            }
            return this.schema.parse(input);
        } catch (error: unknown) {
            throw new ParseError(input, error);
        }
    }

    toJsonSchema(): Record<string, unknown> {
        if (this.schema instanceof z.ZodVoid) {
            // z.void() cannot be represented in JSON Schema, so it's substituted with an empty object schema
            return EMPTY_OBJECT_SCHEMA;
        }
        return z.toJSONSchema(this.schema) as Record<string, unknown>;
    }
}
