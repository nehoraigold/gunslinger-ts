//region imports
import { IItem } from "./IItem";

//endregion

export interface IInventory {
    size: number
    add(item: IItem): void
    remove(itemToRemove: IItem): boolean
    pop(name: string): IItem | undefined;
    peek(name: string): IItem | undefined;
}