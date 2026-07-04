export class ParseError extends Error {
    public readonly input: unknown;

    constructor(input: unknown, cause?: unknown) {
        super('Unable to parse input', { cause });
        this.name = 'ParseError';
        this.input = input;
    }
}
