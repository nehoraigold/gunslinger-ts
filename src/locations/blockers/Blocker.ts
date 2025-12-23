//region imports
import { IBlocker } from "../../types/locations/IBlocker";
//endregion

export class Blocker implements IBlocker {
    public name: string;
    public description: string;
    public blockMessage: string;

    constructor(name: string) {
        this.name = name;
        this.description = "";
        this.blockMessage = "You can't go that way.";
    }

    allowPassage(): boolean {
        return false;
    }

    interact(): string | null {
        return null;
    }
}
