//region imports
import { IItem } from "../objects/IItem";
//endregion

export interface Transactor {
    Take(item: IItem): void
    Drop(item: IItem): void
    Has(itemName: string): boolean
}
