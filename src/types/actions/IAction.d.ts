//region imports
import { ActionType } from "../../actions/ActionType";
//endregion


export interface IAction {
    Type: ActionType
    Data: unknown
}
