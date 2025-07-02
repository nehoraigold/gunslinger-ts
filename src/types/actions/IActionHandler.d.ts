//region imports
import { IAction } from "./IAction";
import { IRoom } from "../locations/IRoom";
//endregion

export interface IActionHandler {
    Handle(action?: IAction, room?: IRoom): void | Promise<void>
}
