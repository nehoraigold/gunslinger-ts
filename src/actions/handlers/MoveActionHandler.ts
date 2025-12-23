//region imports
import { IActionHandler } from "./IActionHandler";
import { IRoom } from "../../locations/IRoom";
import { IPlayer } from "../../characters/IPlayer";
import { IWorld } from "../../locations/IWorld";
import { MoveAction } from "../action_types/MoveAction";
import { MoveDirection } from "../action_types/action_data/MoveDirection";
import { AddCoordinates } from "../../utils/utils";
import { Print } from "../../utils/print";
import { ActionType } from "../ActionType";
//endregion

export class MoveActionHandler implements IActionHandler<ActionType.MOVE> {
    constructor(private readonly world: IWorld, private readonly player: IPlayer) {
        this.world = world;
        this.player = player;
    }

    handle(action: MoveAction, room: IRoom): void {
        const direction = action.data;
        const blocker = room.getBlocker(direction);
        if (blocker && !blocker.allowPassage(this.player)) {
            Print.Message(blocker.blockMessage);
            return;
        }
        const newRoom = this.getNewRoom(direction);
        if (newRoom) {
            this.player.move(direction);
            Print.Message(newRoom.visit());
        } else {
            Print.Message("You cannot go that way.");
        }
    }

    private getNewRoom(direction: MoveDirection): IRoom | undefined {
        return this.world.getRoom(AddCoordinates(this.player.location, direction.value));
    }
}
