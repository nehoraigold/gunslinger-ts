//region imports
import { IActionParser } from "../../types/actions/IActionParser";
import { IAction } from "../../types/actions/IAction";
import { LookAction } from "../action_types/LookAction";
//endregion

export class LookActionParser implements IActionParser {
    Words: Array<string> = ["look", "describe", "observe"];

    Parse(): IAction {
        return new LookAction();
    }
}
