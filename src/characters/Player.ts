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
    private readonly name: string;
    private coordinate: Coordinate;
    private inventory: IInventory;
    public Description: string;

    constructor(name: string, location: Coordinate) {
        this.name = name;
        this.Description = "";
        this.coordinate = location;
        this.inventory = new Inventory();
    }

    get Name(): string {
        return this.name;
    }

    get Location(): Coordinate {
        return this.coordinate;
    }

    Move(direction: MoveDirection): Coordinate {
        this.coordinate = AddCoordinates(this.coordinate, direction.Value);
        return this.coordinate;
    }

    Drop(item: IItem): void {
        this.inventory.Remove(item);
    }

    Has(itemName: string): boolean {
        return this.inventory.Peek(itemName) !== undefined;
    }

    Take(item: IItem): void {
        this.inventory.Add(item);
    }
}
