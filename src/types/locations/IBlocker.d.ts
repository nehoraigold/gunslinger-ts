//region imports
import { IPlayer } from "../characters/IPlayer";
import { Describable } from "../generic/Describable";
//endregion

export interface IBlocker extends Describable {
    BlockMessage: string
    Interact(interaction: string, context: any): string | null
    AllowPassage(player: IPlayer): boolean
}
