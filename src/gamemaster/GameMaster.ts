export interface GameMaster {
    handleInput(rawText: string): ReadableStream<string>;
}
