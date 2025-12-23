//region imports
import { ActionBase } from "../ActionBase";
import { ActionType } from "../ActionType";
import { MoveDirection } from "./action_data/MoveDirection";
//endregion

export class MoveAction extends ActionBase<ActionType.MOVE> {
    constructor(direction: MoveDirection) {
        super(ActionType.MOVE, direction);
    }
}
