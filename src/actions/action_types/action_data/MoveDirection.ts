//region imports
import { Coordinate } from "../../../utils/Coordinate";
//endregion

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';


export class MoveDirection {
    public static readonly UP = new MoveDirection("UP", { x: 0, y: -1 });
    public static readonly DOWN = new MoveDirection("DOWN", { x: 0, y: 1 });
    public static readonly LEFT = new MoveDirection("LEFT", { x: -1, y: 0 });
    public static readonly RIGHT = new MoveDirection("RIGHT", { x: 1, y: 0 });

    private constructor(public readonly key: Direction, public readonly value: Coordinate) {
        this.key = key;
        this.value = value;
    }

    public toString(): Direction {
        return this.key;
    }
}
