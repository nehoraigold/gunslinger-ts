//region imports
import { IItem } from "../types/objects/IItem";
import { IInventory } from "../types/objects/IInventory";
//endregion

export class Inventory implements IInventory {
    private items: Array<IItem>;

    constructor() {
        this.items = [];
    }

    Add(item: IItem): void {
        this.items.push(item);
    }

    Peek(name: string): IItem | undefined {
        return this.items.find((item: IItem) => item.Name === name);
    }

    Pop(name: string): IItem | undefined {
        const item = this.Peek(name);
        if (item) {
            this.Remove(item);
        }
        return item;
    }

    Remove(itemToRemove: IItem): boolean {
        const preRemoveSize = this.Size;
        this.items = this.items.filter((item: IItem) => item !== itemToRemove);
        return this.Size < preRemoveSize;
    }

    get Size(): number {
        return this.items.length;
    }
}
