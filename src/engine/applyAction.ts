import { GameState } from "./game.state";
import { Action, ActionType } from "../action";
import { move } from "../reducer";


export const applyAction = (gameState: GameState, action: Action): GameState => {
    switch (action.type) {
        case ActionType.MOVE: {
            return move(gameState, action.data.direction);
        }
        default:
            return gameState;
    }
}