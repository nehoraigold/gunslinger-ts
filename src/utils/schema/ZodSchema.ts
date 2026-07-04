import { z } from 'zod';
import { Schema } from './Schema';
import { ParseError } from './ParseError';

const EMPTY_OBJECT_SCHEMA: Record<string, unknown> = { type: 'object', properties: {} };

export class ZodSchema<T> implements Schema<T> {
    constructor(private readonly schema: z.ZodType<T>) {}

    parse(input: unknown): T {
        try {
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
