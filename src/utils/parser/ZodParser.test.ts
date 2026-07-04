import { describe, it } from 'mocha';
import { expect } from 'chai';
import { z } from 'zod';

import { ZodParser } from './ZodParser';
import { ParseError } from './ParseError';

describe(ZodParser.name, () => {
    describe('parse', () => {
        const parser = new ZodParser(
            z
                .object({
                    str: z.string(),
                    int: z.number().optional(),
                    enum: z.enum(['small', 'medium', 'large']),
                })
                .strict(),
        );

        const VALID_INPUTS = [
            {
                str: 'a string',
                enum: 'small',
            },
            {
                str: 'a string',
                int: 3,
                enum: 'medium',
            },
            {
                str: 'a string',
                int: undefined,
                enum: 'large',
            },
        ];

        VALID_INPUTS.forEach((input) => {
            it('should parse matching inputs correctly', () => {
                const result = parser.parse(input);

                expect(result).to.deep.equal(input);
            });
        });

        const INVALID_CASES = [
            {
                name: 'is the wrong type',
                input: 'string input',
            },
            {
                name: 'has a field with the wrong type',
                input: {
                    str: ['not', 'a', 'string'],
                    int: 3,
                    enum: 'small',
                },
            },
            {
                name: 'is missing a required field',
                input: {
                    int: 4,
                    enum: 'medium',
                },
            },
            {
                name: 'has an extra unknown field',
                input: {
                    str: 'a string',
                    enum: 'large',
                    extra: ['does', 'not', 'belong'],
                },
            },
        ];

        INVALID_CASES.forEach(({ name, input }) => {
            it(`should throw a ParseError if input ${name}`, () => {
                const parse = () => parser.parse(input);

                expect(parse).to.throw(ParseError);
            });
        });
    });
});
