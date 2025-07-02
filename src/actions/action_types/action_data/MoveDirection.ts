//region imports
import { Coordinate } from "../../../types/utils/Coordinate";
//endregion


export class MoveDirection {
    public static readonly UP = new MoveDirection("UP", { X: 0, Y: -1 });
    public static readonly DOWN = new MoveDirection("DOWN", { X: 0, Y: 1 });
    public static readonly LEFT = new MoveDirection("LEFT", { X: -1, Y: 0 });
    public static readonly RIGHT = new MoveDirection("RIGHT", { X: 1, Y: 0 });

    private constructor(public readonly Key: string, public readonly Value: Coordinate) {
        this.Key = Key;
        this.Value = Value;
    }

    public toString(): string {
        return this.Key;
    }
}
