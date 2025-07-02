//region imports
import { IActionParser } from "../../types/actions/IActionParser";
import { IAction } from "../../types/actions/IAction";
import { ActionType } from "../ActionType";
import { MoveActionParser } from "./MoveActionParser";
import { QuitActionParser } from "./QuitActionParser";
import { LookActionParser } from "./LookActionParser";

//endregion

export class ActionParser implements IActionParser {
    public readonly Words: Array<string>;
    private readonly actionParsers: Map<ActionType, IActionParser>;

    constructor() {
        this.Words = [];
        this.actionParsers = new Map<ActionType, IActionParser>([
            [ActionType.MOVE, new MoveActionParser()],
            [ActionType.QUIT, new QuitActionParser()],
            [ActionType.LOOK, new LookActionParser()]
        ]);
    }

    Parse(string: string): IAction {
        string = string.trim().toLowerCase();
        const firstWord = ActionParser.getFirstWord(string);
        for (const parser of this.actionParsers.values()) {
            if (parser.Words.includes(firstWord)) {
                return parser.Parse(string);
            }
        }
        throw new Error(`Unable to parse "${string}"`);
    }

    private static getFirstWord(string: string): string {
        return string.split(" ")[0];
    }
}
