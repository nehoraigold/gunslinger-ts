//region imports
import { ActionData } from "../../actions/action_types/action_data/ActionData";
import { ActionType } from "../../actions/ActionType";
//endregion


export interface IAction<ActionT = any> {
    type: ActionT
    data: ActionData<ActionT>
}
