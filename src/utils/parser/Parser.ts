export interface Parser<T> {
    parse(input: unknown): T;
}
