//region imports
import { IActionParser } from "../../types/actions/IActionParser";
import { IAction } from "../../types/actions/IAction";
import { LookAction } from "../action_types/LookAction";
import { ActionType } from "../ActionType";
//endregion

export class LookActionParser implements IActionParser {
    words: Array<string> = ["look", "describe", "observe"];

    parse(): IAction<ActionType.LOOK> {
        return new LookAction();
    }
}
