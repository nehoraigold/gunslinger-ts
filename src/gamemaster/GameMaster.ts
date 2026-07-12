import { AvailableChoice } from './choice';

export interface GameMaster {
    handleInput(rawText: string): ReadableStream<string>;
    selectChoice(choiceId: string): ReadableStream<string>;
    currentChoices(): AvailableChoice[];
}
