//region imports
import { ActionType } from "../ActionType";
import { ActionBase } from "../ActionBase";
//endregion

export class QuitAction extends ActionBase<ActionType.QUIT> {
    constructor() {
        super(ActionType.QUIT, null);
    }
}
