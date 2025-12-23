//region imports
import { IItem } from "../objects/IItem";
//endregion

export interface Transactor {
    take(item: IItem): void
    drop(item: IItem): void
    has(itemName: string): boolean
}
