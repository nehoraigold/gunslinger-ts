import { describe, it } from 'mocha';
import { expect } from 'chai';
import { z } from 'zod';

import { ZodSchema } from './ZodSchema';
import { ParseError } from './ParseError';

describe(ZodSchema.name, () => {
    describe('parse', () => {
        const schema = new ZodSchema(
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
                const result = schema.parse(input);

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
                const parse = () => schema.parse(input);

                expect(parse).to.throw(ParseError);
            });
        });

        describe('void schema', () => {
            const voidSchema = new ZodSchema(z.void());

            it('should accept undefined', () => {
                expect(voidSchema.parse(undefined)).to.equal(undefined);
            });

            it('should accept the empty object a tool-caller sends for a no-argument tool', () => {
                expect(voidSchema.parse({})).to.equal(undefined);
            });

            it('should throw a ParseError for a populated object', () => {
                expect(() => voidSchema.parse({ unexpected: true })).to.throw(ParseError);
            });
        });
    });

    describe('toJsonSchema', () => {
        it('should convert an object schema to a JSON Schema object', () => {
            const schema = new ZodSchema(z.object({ direction: z.string() }));

            const jsonSchema = schema.toJsonSchema();

            expect(jsonSchema.type).to.equal('object');
            expect(jsonSchema.properties).to.have.property('direction');
        });

        it('should represent a void schema as an empty object schema', () => {
            const schema = new ZodSchema(z.void());

            expect(schema.toJsonSchema()).to.deep.equal({ type: 'object', properties: {} });
        });
    });
});
