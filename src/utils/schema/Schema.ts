export interface Schema<T> {
    parse(input: unknown): T;
    toJsonSchema(): Record<string, unknown>;
}
