//region imports
import { IActionHandler } from "../../types/actions/IActionHandler";
import { IAction } from "../../types/actions/IAction";
import { IRoom } from "../../types/locations/IRoom";
import { IPlayer } from "../../types/characters/IPlayer";
import { IWorld } from "../../types/locations/IWorld";
import { ActionType } from "../ActionType";
import { MoveActionHandler } from "./MoveActionHandler";
import { QuitActionHandler } from "./QuitActionHandler";
import { LookActionHandler } from "./LookActionHandler";

//endregion

export class ActionHandler implements IActionHandler {
    private readonly actionHandlers: Map<ActionType, IActionHandler>;

    constructor(world: IWorld, player: IPlayer) {
        this.actionHandlers = new Map<ActionType, IActionHandler>([
            [ActionType.MOVE, new MoveActionHandler(world, player)],
            [ActionType.QUIT, new QuitActionHandler()],
            [ActionType.LOOK, new LookActionHandler()]
        ]);
    }

    Handle(action: IAction, room: IRoom): Promise<void> | void {
        const handler = this.actionHandlers.get(action.Type);
        if (handler) {
            return handler.Handle(action, room);
        }
    }

}
