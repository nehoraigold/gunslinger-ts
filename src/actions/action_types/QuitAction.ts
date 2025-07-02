//region imports
import { ActionType } from "../ActionType";
import { ActionBase } from "../ActionBase";
//endregion

export class QuitAction extends ActionBase {
    public Data: null;

    constructor() {
        super(ActionType.QUIT);
    }
}
