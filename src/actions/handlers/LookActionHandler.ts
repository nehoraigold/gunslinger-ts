//region imports
import { IActionHandler } from "../../types/actions/IActionHandler";
import { IAction } from "../../types/actions/IAction";
import { IRoom } from "../../types/locations/IRoom";
import { Print } from "../../utils/print";
//endregion

export class LookActionHandler implements IActionHandler {
    Handle(action: IAction, room: IRoom): void {
        Print.Message(room.Description);
    }
}
