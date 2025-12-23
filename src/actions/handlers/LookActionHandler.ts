//region imports
import { IActionHandler } from "../../types/actions/IActionHandler";
import { IAction } from "../../types/actions/IAction";
import { IRoom } from "../../types/locations/IRoom";
import { Print } from "../../utils/print";
import { ActionType } from "../ActionType";
//endregion

export class LookActionHandler implements IActionHandler<ActionType.LOOK> {
    handle(action: IAction<ActionType.LOOK>, room: IRoom): void {
        Print.Message(room.description);
    }
}
