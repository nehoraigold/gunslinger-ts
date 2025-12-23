//region imports
import { IActionParser } from "./IActionParser";
import { IAction } from "../IAction";
import { LookAction } from "../action_types/LookAction";
import { ActionType } from "../ActionType";
//endregion

export class LookActionParser implements IActionParser {
    words: Array<string> = ["look", "describe", "observe"];

    parse(): IAction<ActionType.LOOK> {
        return new LookAction();
    }
}
