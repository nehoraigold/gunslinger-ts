//region imports
import { IPlayer } from "../types/characters/IPlayer";
import { Coordinate } from "../types/utils/Coordinate";
import { IInventory } from "../types/objects/IInventory";
import { IItem } from "../types/objects/IItem";
import { MoveDirection } from "../actions/action_types/action_data/MoveDirection";
import { AddCoordinates } from "../utils/utils";
import { Inventory } from "../objects/Inventory";
//endregion

export class Player implements IPlayer {
    public name: string;
    public description: string;
    private coordinate: Coordinate;
    private inventory: IInventory;

    constructor(name: string, location: Coordinate) {
        this.name = name;
        this.description = "";
        this.coordinate = location;
        this.inventory = new Inventory();
    }

    get location(): Coordinate {
        return this.coordinate;
    }

    move(direction: MoveDirection): Coordinate {
        this.coordinate = AddCoordinates(this.coordinate, direction.value);
        return this.coordinate;
    }

    drop(item: IItem): void {
        this.inventory.remove(item);
    }

    has(itemName: string): boolean {
        return this.inventory.peek(itemName) !== undefined;
    }

    take(item: IItem): void {
        this.inventory.add(item);
    }
}
