//region imports
import { Describable } from "../utils/Describable";
import { IBlocker } from "./blockers/IBlocker";
import { MoveDirection } from "../actions/action_types/action_data/MoveDirection";
//endregion


export interface IRoom extends Describable {
    hasVisited: boolean
    visit(): string
    addBlocker(direction: MoveDirection, blocker: IBlocker): void
    getBlocker(direction: MoveDirection): IBlocker | undefined
}
