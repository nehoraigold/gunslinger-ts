//region imports
import { Describable } from "../generic/Describable";
import { Interactable } from "../generic/Interactable";
//endregion

export interface IItem extends Describable, Interactable {
    Value: number
    IsTransferable: boolean
}
