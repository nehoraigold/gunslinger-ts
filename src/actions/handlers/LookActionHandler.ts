//region imports
import { IActionHandler } from "./IActionHandler";
import { IAction } from "../IAction";
import { IRoom } from "../../locations/IRoom";
import { Print } from "../../utils/print";
import { ActionType } from "../ActionType";
//endregion

export class LookActionHandler implements IActionHandler<ActionType.LOOK> {
    handle(action: IAction<ActionType.LOOK>, room: IRoom): void {
        Print.Message(room.description);
    }
}
