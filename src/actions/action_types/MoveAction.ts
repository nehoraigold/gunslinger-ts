//region imports
import { ActionBase } from "../ActionBase";
import { ActionType } from "../ActionType";
import { MoveDirection } from "./action_data/MoveDirection";
//endregion

export class MoveAction extends ActionBase {
    public readonly Data: MoveDirection;

    constructor(direction: MoveDirection) {
        super(ActionType.MOVE);
        this.Data = direction;
    }
}
