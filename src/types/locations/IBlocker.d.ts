//region imports
import { IPlayer } from "../characters/IPlayer";
import { Describable } from "../generic/Describable";
//endregion

export interface IBlocker extends Describable {
    blockMessage: string
    interact(interaction: string, context: any): string | null
    allowPassage(player: IPlayer): boolean
}
