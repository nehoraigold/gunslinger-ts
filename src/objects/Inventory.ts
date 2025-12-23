//region imports
import { IItem } from "../types/objects/IItem";
import { IInventory } from "../types/objects/IInventory";
//endregion

export class Inventory implements IInventory {
    private items: Array<IItem>;

    constructor() {
        this.items = [];
    }

    add(item: IItem): void {
        this.items.push(item);
    }

    peek(name: string): IItem | undefined {
        return this.items.find((item: IItem) => item.name === name);
    }

    pop(name: string): IItem | undefined {
        const item = this.peek(name);
        if (item) {
            this.remove(item);
        }
        return item;
    }

    remove(itemToRemove: IItem): boolean {
        const preRemoveSize = this.size;
        this.items = this.items.filter((item: IItem) => item !== itemToRemove);
        return this.size < preRemoveSize;
    }

    get size(): number {
        return this.items.length;
    }
}
