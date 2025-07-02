//region imports
import { IItem } from "./IItem";

//endregion

export interface IInventory {
    Size: number
    Add(item: IItem): void
    Remove(itemToRemove: IItem): boolean
    Pop(name: string): IItem | undefined;
    Peek(name: string): IItem | undefined;
}