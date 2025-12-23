//region imports
import { IActionParser } from "../../types/actions/IActionParser";
import { IAction } from "../../types/actions/IAction";
import { ActionType } from "../ActionType";
import { MoveActionParser } from "./MoveActionParser";
import { QuitActionParser } from "./QuitActionParser";
import { LookActionParser } from "./LookActionParser";

//endregion

export class ActionParser implements IActionParser {
    public readonly words: Array<string>;
    private readonly actionParsers: Partial<{
        [K in ActionType]: IActionParser;
    }>;

    constructor() {
        this.words = [];
        this.actionParsers = {
            [ActionType.MOVE]: new MoveActionParser(),
            [ActionType.QUIT]: new QuitActionParser(),
            [ActionType.LOOK]: new LookActionParser(),
        };
    }

    parse(string: string): IAction {
        string = string.trim().toLowerCase();
        const firstWord = ActionParser.getFirstWord(string);
        for (const parser of Object.values(this.actionParsers)) {
            if (parser.words.includes(firstWord)) {
                return parser.parse(string);
            }
        }
        throw new Error(`Unable to parse "${string}"`);
    }

    private static getFirstWord(string: string): string {
        return string.split(" ")[0];
    }
}
