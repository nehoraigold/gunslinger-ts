//region imports
import { Transactor } from "../generic/Transactor";
import { Coordinate } from "../utils/Coordinate";
import { MoveDirection } from "../../actions/action_types/action_data/MoveDirection";
import { Describable } from "../generic/Describable";
//endregion

export interface IPlayer extends Describable, Transactor {
    Location: Coordinate
    Move(direction: MoveDirection): Coordinate
}
