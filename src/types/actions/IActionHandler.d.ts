//region imports
import { IAction } from "./IAction";
import { IRoom } from "../locations/IRoom";
//endregion

export interface IActionHandler<ActionT> {
    handle(action?: IAction<ActionT>, room?: IRoom): void | Promise<void>
}
