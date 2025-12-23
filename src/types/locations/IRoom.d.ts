//region imports
import { Describable } from "../generic/Describable";
import { IBlocker } from "./IBlocker";
import { MoveDirection } from "../../actions/action_types/action_data/MoveDirection";
//endregion


export interface IRoom extends Describable {
    hasVisited: boolean
    visit(): string
    addBlocker(direction: MoveDirection, blocker: IBlocker): void
    getBlocker(direction: MoveDirection): IBlocker | undefined
}
