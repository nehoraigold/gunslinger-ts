//region imports
import { Coordinate } from "../utils/Coordinate";
import { IRoom } from "./IRoom";
import { IWorld } from "./IWorld";
import { CoordinateToString } from "../utils/utils";
//endregion

export class World implements IWorld {
    private readonly board: Map<string, IRoom>;

    constructor(board: Map<Coordinate, IRoom>) {
        this.board = new Map<string, IRoom>();
        for (const [coordinate, room] of board.entries()) {
            this.board.set(CoordinateToString(coordinate), room);
        }
    }

    getRoom(coordinate: Coordinate): IRoom | undefined {
        return this.board.get(CoordinateToString(coordinate));
    }
}
