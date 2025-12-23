//region imports
import { ActionType } from "../ActionType";
import { ActionBase } from "../ActionBase";
//endregion

export class LookAction extends ActionBase<ActionType.LOOK> {
    constructor() {
        super(ActionType.LOOK, null);
    }
}
