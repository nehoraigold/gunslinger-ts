//region imports
import { IRoom }  from "./IRoom";
import { IBlocker } from "./blockers/IBlocker";
import { MoveDirection } from "../actions/action_types/action_data/MoveDirection";
import { FormatToHeader } from "../utils/utils";
//endregion

export class Room implements IRoom {
    public readonly name: string;
    public description: string;
    private visited: boolean;
    private blockers: Map<MoveDirection, IBlocker>;

    constructor(name: string, description?: string) {
        this.name = name;
        this.description = description || "Default description";
        this.blockers = new Map();
        this.visited = false;
    }


    get hasVisited(): boolean {
        return this.visited;
    }

    visit(): string {
        let message = FormatToHeader(this.name);
        if (!this.visited) {
            message += `\n${this.description}`;
        }
        this.visited = true;
        return message;
    }

    addBlocker(direction: MoveDirection, blocker: IBlocker): void {
        this.blockers.set(direction, blocker);
    }

    getBlocker(direction: MoveDirection): IBlocker | undefined {
        return this.blockers.get(direction);
    }
}
