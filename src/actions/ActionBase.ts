//region imports
import { IAction } from "./IAction";
import { ActionData } from "./action_types/action_data/ActionData";
import { ActionType } from "./ActionType";
//endregion

export class ActionBase<ActionT> implements IAction<ActionT> {
    public readonly type: ActionT;
    public readonly data: ActionData<ActionT>;

    protected constructor(type: ActionT, data: ActionData<ActionT>) {
        this.type = type;
        this.data = data;
    }
}
