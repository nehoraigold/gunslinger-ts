//region imports
import { Transactor } from "../utils/Transactor";
import { Coordinate } from "../utils/Coordinate";
import { Describable } from "../utils/Describable";
import { MoveDirection } from "../actions/action_types/action_data/MoveDirection";
//endregion

export interface IPlayer extends Describable, Transactor {
    location: Coordinate
    move(direction: MoveDirection): Coordinate
}
