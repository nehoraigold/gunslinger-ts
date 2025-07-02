//region imports
import { Coordinate } from "../utils/Coordinate";
import { IRoom } from "./IRoom";
//endregion

export interface IWorld {
    GetRoom(coordinate: Coordinate): IRoom | undefined
}
