//region imports
import { IAction } from "./IAction";
//endregion

export interface IActionParser {
    Words: Array<string>
    Parse(string: string): IAction
}
