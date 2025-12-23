//region imports
import { IAction } from "./IAction";
//endregion

export interface IActionParser {
    words: Array<string>
    parse(string: string): IAction
}
