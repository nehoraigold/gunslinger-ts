//region imports
import { IActionHandler } from "./IActionHandler";
import { IAction } from "../IAction";
import { IRoom } from "../../locations/IRoom";
import { IPlayer } from "../../characters/IPlayer";
import { IWorld } from "../../locations/IWorld";
import { ActionType } from "../ActionType";
import { MoveActionHandler } from "./MoveActionHandler";
import { QuitActionHandler } from "./QuitActionHandler";
import { LookActionHandler } from "./LookActionHandler";
//endregion

type ActionHandlers = Partial<{
    [K in ActionType]: IActionHandler<K>;
}>;

export class ActionHandler implements IActionHandler<ActionType> {
    private readonly actionHandlers: ActionHandlers;

    constructor(world: IWorld, player: IPlayer) {
        this.actionHandlers = {
            [ActionType.MOVE]: new MoveActionHandler(world, player),
            [ActionType.QUIT]: new QuitActionHandler(),
            [ActionType.LOOK]: new LookActionHandler(),
        };
    }

    handle(action: IAction<ActionType>, room: IRoom): Promise<void> | void {
        const handler = this.actionHandlers[action.type];
        if (handler) {
            return handler.handle(action as any, room);
        }
    }
}
