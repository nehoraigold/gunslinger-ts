// region
import { ActionType } from "../../ActionType"
import { MoveDirection } from "./MoveDirection"
// endregion

export type ActionData<T> = T extends ActionType.MOVE ? MoveDirection : null;