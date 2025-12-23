//region imports
import { IActionParser } from "../../types/actions/IActionParser";
import { IAction } from "../../types/actions/IAction";
import { QuitAction } from "../action_types/QuitAction";
import { ActionType } from "../ActionType";
//endregion

export class QuitActionParser implements IActionParser {
    words: Array<string> = ["quit", "exit", "q"];

    parse(): IAction<ActionType.QUIT> {
        return new QuitAction();
    }
}
