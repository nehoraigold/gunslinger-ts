//region imports
import { IRoom }  from "../types/locations/IRoom";
import { IBlocker } from "../types/locations/IBlocker";
import { MoveDirection } from "../actions/action_types/action_data/MoveDirection";
import { FormatToHeader } from "../utils/utils";
//endregion

export class Room implements IRoom {
    private readonly name: string;
    private description: string;
    private hasVisited: boolean;
    private blockers: Map<MoveDirection, IBlocker>;

    constructor(name: string, description?: string) {
        this.name = name;
        this.description = description || "Default description";
        this.blockers = new Map();
        this.hasVisited = false;
    }

    get Name(): string {
        return this.name;
    }

    get Description(): string {
        return this.description;
    }

    set Description(description: string) {
        this.description = description;
    }

    get HasVisited(): boolean {
        return this.hasVisited;
    }

    Visit(): string {
        let message = FormatToHeader(this.Name);
        if (!this.hasVisited) {
            message += `\n${this.Description}`;
        }
        this.hasVisited = true;
        return message;
    }

    AddBlocker(direction: MoveDirection, blocker: IBlocker): void {
        this.blockers.set(direction, blocker);
    }

    GetBlocker(direction: MoveDirection): IBlocker | undefined {
        return this.blockers.get(direction);
    }
}
