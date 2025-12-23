//region imports
import { ActionData } from "./action_types/action_data/ActionData";
//endregion


export interface IAction<ActionT = any> {
    type: ActionT
    data: ActionData<ActionT>
}
