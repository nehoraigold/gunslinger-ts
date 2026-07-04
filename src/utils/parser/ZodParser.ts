import { z } from 'zod';
import { Parser } from './Parser';
import { ParseError } from './ParseError';

export class ZodParser<T> implements Parser<T> {
    constructor(private readonly schema: z.ZodSchema<T>) {}

    parse(input: unknown): T {
        try {
            return this.schema.parse(input);
        } catch (error: unknown) {
            throw new ParseError(input, error);
        }
    }
}
