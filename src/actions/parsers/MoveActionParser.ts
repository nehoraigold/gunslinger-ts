//region imports
import { IActionParser } from "./IActionParser";
import { IAction } from "../IAction";
import { MoveDirection } from "../action_types/action_data/MoveDirection";
import { MoveAction } from "../action_types/MoveAction";
import { ActionType } from "../ActionType";
//endregion


export class MoveActionParser implements IActionParser {
    private readonly MOVE_WORDS = ["move", "go", "walk"];
    private readonly UP_WORDS = ["u", "n", "north", "up"];
    private readonly DOWN_WORDS = ["d", "s", "south", "down"];
    private readonly LEFT_WORDS = ["l", "w", "west", "left"];
    private readonly RIGHT_WORDS = ["r", "e", "east", "right"];

    get words(): Array<string> {
        return [
            ...this.MOVE_WORDS,
            ...this.UP_WORDS,
            ...this.DOWN_WORDS,
            ...this.LEFT_WORDS,
            ...this.RIGHT_WORDS
        ];
    }

    parse(string: string): IAction<ActionType> {
        const words = string.split(" ");
        for (const word of words) {
            const direction = this.tryParseToDirection(word);
            if (direction) {
                return new MoveAction(direction);
            }
        }
        throw new Error(`Unable to parse move action ${string}`);
    }

    private tryParseToDirection(word: string): MoveDirection | null {
        if (this.UP_WORDS.includes(word)) {
            return MoveDirection.UP;
        } else if (this.DOWN_WORDS.includes(word)) {
            return MoveDirection.DOWN;
        } else if (this.LEFT_WORDS.includes(word)) {
            return MoveDirection.LEFT;
        } else if (this.RIGHT_WORDS.includes(word)) {
            return MoveDirection.RIGHT;
        }
        return null;
    }
}
