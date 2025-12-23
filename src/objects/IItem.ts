//region imports
import { Describable } from "../utils/Describable";
import { Interactable } from "../utils/Interactable";
//endregion

export interface IItem extends Describable, Interactable {
    value: number
    isTransferable: boolean
}
