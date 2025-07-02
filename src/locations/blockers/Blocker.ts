//region imports
import { IBlocker } from "../../types/locations/IBlocker";
//endregion

export class Blocker implements IBlocker {
    public Name: string;
    public Description: string;
    public BlockMessage: string;

    constructor(name: string) {
        this.Name = name;
        this.Description = "";
        this.BlockMessage = "You can't go that way.";
    }

    AllowPassage(): boolean {
        return false;
    }

    Interact(): string | null {
        return null;
    }
}
