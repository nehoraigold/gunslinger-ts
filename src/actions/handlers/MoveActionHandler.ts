//region imports
import { IActionHandler } from "../../types/actions/IActionHandler";
import { IRoom } from "../../types/locations/IRoom";
import { IPlayer } from "../../types/characters/IPlayer";
import { IWorld } from "../../types/locations/IWorld";
import { MoveAction } from "../action_types/MoveAction";
import { MoveDirection } from "../action_types/action_data/MoveDirection";
import { AddCoordinates } from "../../utils/utils";
import { Print } from "../../utils/print";
//endregion

export class MoveActionHandler implements IActionHandler {
    constructor(private readonly world: IWorld, private readonly player: IPlayer) {
        this.world = world;
        this.player = player;
    }

    Handle(action: MoveAction, room: IRoom): void {
        const direction = action.Data;
        const blocker = room.GetBlocker(direction);
        if (blocker && !blocker.AllowPassage(this.player)) {
            Print.Message(blocker.BlockMessage);
            return;
        }
        const newRoom = this.getNewRoom(direction);
        if (newRoom) {
            this.player.Move(direction);
            Print.Message(newRoom.Visit());
        } else {
            Print.Message("You cannot go that way.");
        }
    }

    private getNewRoom(direction: MoveDirection): IRoom | undefined {
        return this.world.GetRoom(AddCoordinates(this.player.Location, direction.Value));
    }
}
