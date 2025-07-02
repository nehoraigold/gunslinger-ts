//region imports
import { IActionParser } from "../../types/actions/IActionParser";
import { IAction } from "../../types/actions/IAction";
import { QuitAction } from "../action_types/QuitAction";
//endregion

export class QuitActionParser implements IActionParser {
    Words: Array<string> = ["quit", "exit", "q"];

    Parse(): IAction {
        return new QuitAction();
    }
}
