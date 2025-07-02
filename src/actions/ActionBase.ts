//region imports
import { IAction } from "../types/actions/IAction";
import { ActionType } from "./ActionType";
//endregion

export abstract class ActionBase implements IAction {
    public readonly Type: ActionType;
    public abstract readonly Data: unknown;

    protected constructor(type: ActionType) {
        this.Type = type;
    }
}
